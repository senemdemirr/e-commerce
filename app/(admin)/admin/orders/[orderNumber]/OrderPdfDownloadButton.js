'use client';

import { useState } from 'react';
import { useSnackbar } from 'notistack';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Button } from '@mui/material';
import DownloadRoundedIcon from '@mui/icons-material/DownloadRounded';
import {
    formatPaymentMethod,
    formatPaymentStatus,
    formatText,
} from '@/lib/admin/order-display';

function formatPdfDate(dateString) {
    return new Date(dateString).toLocaleString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function formatPdfCurrency(amount) {
    return `₺${Number(amount || 0).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    })}`;
}

export default function OrderPdfDownloadButton({ order, currentStatusTitle }) {
    const { enqueueSnackbar } = useSnackbar();
    const [downloadingPdf, setDownloadingPdf] = useState(false);

    const customerName = order?.customer_name?.trim() || order?.shipping_full_name || 'Guest Customer';
    const customerPhone = order?.customer_phone || order?.shipping_phone;
    const customerEmail = order?.customer_email || 'Email not available';
    const cardDetails = [order?.card_bank, order?.card_family, order?.card_mask].filter(Boolean).join(' • ');
    const shippingLocation = [order?.shipping_district, order?.shipping_city].filter(Boolean).join(' / ');

    const handleDownloadPdf = async () => {
        if (!order) {
            return;
        }

        try {
            setDownloadingPdf(true);

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'pt',
                format: 'a4',
            });
            const pageWidth = pdf.internal.pageSize.getWidth();
            const pageHeight = pdf.internal.pageSize.getHeight();
            const margin = 40;
            const contentWidth = pageWidth - (margin * 2);
            let cursorY = margin;

            const ensurePageSpace = (requiredHeight = 24) => {
                if (cursorY + requiredHeight <= pageHeight - margin) {
                    return;
                }

                pdf.addPage();
                cursorY = margin;
            };

            const addSectionTitle = (title) => {
                ensurePageSpace(28);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(11);
                pdf.setTextColor(100, 116, 139);
                pdf.text(title.toUpperCase(), margin, cursorY);
                cursorY += 18;
            };

            const addDetailRow = (label, value) => {
                const safeValue = String(value || '-');
                const valueLines = pdf.splitTextToSize(safeValue, contentWidth - 130);
                const rowHeight = Math.max(18, valueLines.length * 14 + 4);

                ensurePageSpace(rowHeight);
                pdf.setFont('helvetica', 'bold');
                pdf.setFontSize(10);
                pdf.setTextColor(71, 85, 105);
                pdf.text(`${label}:`, margin, cursorY);

                pdf.setFont('helvetica', 'normal');
                pdf.setTextColor(15, 23, 42);
                pdf.text(valueLines, margin + 130, cursorY);
                cursorY += rowHeight;
            };

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(22);
            pdf.setTextColor(15, 23, 42);
            pdf.text(`Order #${order.order_number}`, margin, cursorY);

            pdf.setFont('helvetica', 'normal');
            pdf.setFontSize(11);
            pdf.setTextColor(100, 116, 139);
            pdf.text(`Created: ${formatPdfDate(order.created_at)}`, margin, cursorY + 18);
            pdf.text(`Status: ${currentStatusTitle}`, pageWidth - margin, cursorY, { align: 'right' });
            pdf.text(`Payment: ${formatPaymentStatus(order.payment_status)}`, pageWidth - margin, cursorY + 18, { align: 'right' });
            cursorY += 38;

            pdf.setDrawColor(226, 232, 240);
            pdf.line(margin, cursorY, pageWidth - margin, cursorY);
            cursorY += 24;

            addSectionTitle('Customer Information');
            addDetailRow('Customer', customerName);
            addDetailRow('Email', customerEmail);
            addDetailRow('Phone', formatText(customerPhone));
            addDetailRow('Customer ID', order.customer_id ? `#${order.customer_id}` : 'Guest');
            cursorY += 8;

            addSectionTitle('Shipping Information');
            addDetailRow('Address', formatText(order.shipping_address));
            addDetailRow('Location', shippingLocation ? `${shippingLocation}${order.shipping_postal_code ? ` (${order.shipping_postal_code})` : ''}` : '-');
            cursorY += 8;

            addSectionTitle('Payment Information');
            addDetailRow('Payment Method', formatPaymentMethod(order.payment_method));
            addDetailRow('Payment Status', formatPaymentStatus(order.payment_status));
            if (cardDetails) {
                addDetailRow('Card Details', cardDetails);
            }
            cursorY += 12;

            autoTable(pdf, {
                startY: cursorY,
                margin: { left: margin, right: margin },
                head: [['Product', 'Variant', 'Qty', 'Unit Price', 'Total']],
                body: (order.items || []).map((item) => ([
                    [
                        item.item_title,
                        `SKU: ${formatText(item.sku, formatText(item.product_sku))}`,
                    ].join('\n'),
                    [
                        item.selected_size ? `Size: ${item.selected_size}` : 'Standard',
                        item.selected_color ? `Color: ${item.selected_color}` : null,
                    ].filter(Boolean).join('\n'),
                    String(item.quantity || 0),
                    formatPdfCurrency(item.unit_price),
                    formatPdfCurrency(item.total_price),
                ])),
                styles: {
                    font: 'helvetica',
                    fontSize: 10,
                    cellPadding: 8,
                    lineColor: [226, 232, 240],
                    lineWidth: 1,
                    textColor: [15, 23, 42],
                    valign: 'middle',
                },
                headStyles: {
                    fillColor: [248, 250, 252],
                    textColor: [71, 85, 105],
                    fontStyle: 'bold',
                },
                bodyStyles: {
                    fillColor: [255, 255, 255],
                },
                columnStyles: {
                    0: { cellWidth: 190 },
                    1: { cellWidth: 120 },
                    2: { halign: 'center', cellWidth: 55 },
                    3: { halign: 'right', cellWidth: 75 },
                    4: { halign: 'right', cellWidth: 75 },
                },
            });

            cursorY = (pdf.lastAutoTable?.finalY || cursorY) + 24;
            ensurePageSpace(100);

            pdf.setDrawColor(226, 232, 240);
            pdf.line(pageWidth - margin - 220, cursorY, pageWidth - margin, cursorY);
            cursorY += 18;

            const totalsX = pageWidth - margin;
            pdf.setFontSize(11);
            pdf.setTextColor(71, 85, 105);
            pdf.setFont('helvetica', 'normal');
            pdf.text('Subtotal', totalsX - 90, cursorY, { align: 'right' });
            pdf.text(formatPdfCurrency(order.subtotal), totalsX, cursorY, { align: 'right' });
            cursorY += 20;

            pdf.text('Shipping', totalsX - 90, cursorY, { align: 'right' });
            pdf.text(formatPdfCurrency(order.shipping_cost), totalsX, cursorY, { align: 'right' });
            cursorY += 28;

            pdf.setFont('helvetica', 'bold');
            pdf.setFontSize(14);
            pdf.setTextColor(15, 23, 42);
            pdf.text('Total', totalsX - 90, cursorY, { align: 'right' });
            pdf.text(formatPdfCurrency(order.total_amount), totalsX, cursorY, { align: 'right' });

            pdf.save(`order-${order.order_number}.pdf`);
        } catch (error) {
            console.error('PDF generation failed:', error);
            enqueueSnackbar('PDF could not be generated', { variant: 'error' });
        } finally {
            setDownloadingPdf(false);
        }
    };

    return (
        <Button
            onClick={handleDownloadPdf}
            disabled={downloadingPdf}
            startIcon={<DownloadRoundedIcon />}
            className="!rounded-2xl !border !border-primary/10 !bg-white !px-4 !py-2.5 !font-bold !text-text-main hover:!bg-background-light"
        >
            {downloadingPdf ? 'Preparing PDF...' : 'Download'}
        </Button>
    );
}

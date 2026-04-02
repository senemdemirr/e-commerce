'use client';

import { Chip, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined';
import { formatCurrency, formatText } from '../orderDetail.utils';

export default function OrderItemsCard({ items = [] }) {
    return (
        <Paper className="!overflow-hidden !rounded-3xl !border !border-primary/10 !bg-white !shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-primary/10 px-6 py-5">
                <div>
                    <h2 className="font-display text-xl font-bold text-text-main">Sipariş Edilen Ürünler</h2>
                    <p className="mt-1 text-sm text-text-muted">Siparişe bağlı tüm kalemler</p>
                </div>
                <Chip
                    label={`${items.length} kalem ürün`}
                    className="!rounded-full !bg-primary/10 !px-2 !font-semibold !text-primary"
                />
            </div>

            <TableContainer>
                <Table className="min-w-[760px]">
                    <TableHead>
                        <TableRow className="bg-background-light">
                            <TableCell className="!border-b !border-primary/10 !px-6 !py-3 !text-xs !font-bold !uppercase !tracking-[0.18em] !text-text-muted">Ürün</TableCell>
                            <TableCell className="!border-b !border-primary/10 !px-6 !py-3 !text-xs !font-bold !uppercase !tracking-[0.18em] !text-text-muted">Adet</TableCell>
                            <TableCell className="!border-b !border-primary/10 !px-6 !py-3 !text-xs !font-bold !uppercase !tracking-[0.18em] !text-text-muted">Birim Fiyat</TableCell>
                            <TableCell className="!border-b !border-primary/10 !px-6 !py-3 !text-right !text-xs !font-bold !uppercase !tracking-[0.18em] !text-text-muted">Toplam</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {items.map((item) => (
                            <TableRow key={item.id} className="transition-colors hover:bg-background-light/60">
                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex size-14 items-center justify-center overflow-hidden rounded-2xl bg-background-light">
                                            {item.image ? (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img
                                                    src={item.image}
                                                    alt={item.item_title}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <Inventory2OutlinedIcon className="!text-text-muted" />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-sm font-bold text-text-main">{item.item_title}</p>
                                            <p className="text-xs text-text-muted">
                                                {item.selected_size ? `Beden: ${item.selected_size}` : 'Standart'}
                                                {item.selected_color ? ` | Renk: ${item.selected_color}` : ''}
                                            </p>
                                            <p className="text-xs text-text-muted">SKU: {formatText(item.sku, formatText(item.product_sku))}</p>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !font-semibold !text-text-main">
                                    {item.quantity}
                                </TableCell>
                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !font-semibold !text-text-main">
                                    {formatCurrency(item.unit_price)}
                                </TableCell>
                                <TableCell className="!border-b !border-primary/10 !px-6 !py-4 !text-right !font-bold !text-text-main">
                                    {formatCurrency(item.total_price)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Paper>
    );
}

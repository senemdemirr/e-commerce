import Link from 'next/link';
import { Button, Paper } from '@mui/material';
import AddRoundedIcon from '@mui/icons-material/AddRounded';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';

export default function ProductsHeader({ onExport, canMutate }) {
    return (
        <Paper className="!relative !overflow-hidden !rounded-[36px] !border !border-primary/10 !bg-white !shadow-sm">
            <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-primary/15 blur-3xl" />
            <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-28 w-28 rounded-full bg-secondary/20 blur-2xl" />

            <div className="relative flex flex-row items-center justify-between gap-6 p-6 sm:p-8">
                <div className="max-w-3xl">
                    <h1 className="font-display text-3xl font-black tracking-tight text-text-main sm:text-4xl">
                        Ürün Yönetimi
                    </h1>
                    <p className="mt-4 max-w-2xl text-sm leading-7 text-text-muted sm:text-base">
                        Mağazadaki ürünleri tek akışta tarayın, eksik içerikleri ayıklayın ve
                        kategori dağılımını kaybetmeden kataloğu hızla temizleyin.
                    </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3">
                    {canMutate ? (
                        <Button
                            component={Link}
                            href="/admin/products/new"
                            startIcon={<AddRoundedIcon />}
                            size="small"
                            className="!rounded-2xl !bg-primary !px-5 !py-3 !font-bold !normal-case !text-text-main hover:!bg-primary-dark hover:!text-white"
                        >
                            Yeni Ürün Ekle
                        </Button>
                    ) : null}

                    <Button
                        onClick={onExport}
                        startIcon={<FileDownloadOutlinedIcon />}
                        size="small"
                        className="!rounded-2xl !border !border-primary/10 !bg-white !px-5 !py-3 !font-semibold !normal-case !text-text-main hover:!bg-background-light"
                    >
                        CSV İndir
                    </Button>
                </div>
            </div>
        </Paper>
    );
}

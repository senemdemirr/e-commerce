import { Button, Menu, MenuItem } from '@mui/material';
import KeyboardArrowDownRoundedIcon from '@mui/icons-material/KeyboardArrowDownRounded';
import { formatNumber } from './productsPageHelpers';

export default function ProductsFilterMenuButton({
    label,
    valueLabel,
    options,
    anchorEl,
    open,
    onOpen,
    onClose,
    onSelect,
}) {
    return (
        <>
            <Button
                onClick={onOpen}
                endIcon={<KeyboardArrowDownRoundedIcon />}
                className="!rounded-2xl !border !border-primary/10 !bg-background-light !px-4 !py-3 !font-semibold !normal-case !text-text-main hover:!bg-primary/10"
            >
                <span className="text-text-muted">{label}:</span>
                <span className="ml-1">{valueLabel}</span>
            </Button>

            <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={onClose}
                PaperProps={{
                    className: '!mt-2 !rounded-2xl !border !border-primary/10 !bg-white !p-1 !shadow-xl !shadow-primary/10',
                }}
            >
                {options.map((option) => (
                    <MenuItem
                        key={option.value}
                        selected={option.selected}
                        onClick={() => {
                            onSelect(option.value);
                            onClose();
                        }}
                        className="!mx-1 !my-0.5 !rounded-xl !px-4 !py-2.5 !text-sm !text-text-main"
                    >
                        <span>{option.label}</span>
                        {typeof option.count === 'number' ? (
                            <span className="ml-3 text-xs font-semibold text-text-muted">
                                {formatNumber(option.count)}
                            </span>
                        ) : null}
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

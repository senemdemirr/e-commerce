import AutoAwesomeRoundedIcon from '@mui/icons-material/AutoAwesomeRounded';
import {
    Field,
    Input,
    SectionIntro,
    SurfaceCard,
    Textarea,
} from './ProductFormPrimitives';

export default function ProductContentSection({
    materialValue,
    careValue,
    bulletPointsValue,
    descriptionLongValue,
    disabled = false,
    onMaterialChange,
    onCareChange,
    onBulletPointsChange,
    onDescriptionLongChange,
    imageField,
}) {
    return (
        <SurfaceCard className="p-6 sm:p-8">
            <SectionIntro
                eyebrow="Content"
                title="Enrich the detail layer"
                description="Long-form copy, material info, care notes, and sales-driven bullet points make the product more convincing."
                icon={<AutoAwesomeRoundedIcon />}
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Material">
                    <Input
                        value={materialValue}
                        onChange={onMaterialChange}
                        disabled={disabled}
                        placeholder="80% cotton, 20% polyester"
                    />
                </Field>

                {imageField}

                <Field label="Care notes" hint="One rule per line">
                    <Textarea
                        rows={5}
                        value={careValue}
                        onChange={onCareChange}
                        disabled={disabled}
                        placeholder={'Wash at 30°C\nIron on low heat\nDo not tumble dry'}
                    />
                </Field>

                <Field label="Key bullets" hint="One bullet per line">
                    <Textarea
                        rows={5}
                        value={bulletPointsValue}
                        onChange={onBulletPointsChange}
                        disabled={disabled}
                        placeholder={'Soft-touch texture\nRelaxed fit silhouette\nEasy to wear across seasons'}
                    />
                </Field>
            </div>

            <div className="mt-5">
                <Field label="Long description" hint="PDP story">
                    <Textarea
                        rows={6}
                        value={descriptionLongValue}
                        onChange={onDescriptionLongChange}
                        disabled={disabled}
                        placeholder="Expand on the fabric feel, use case, and styling advantage in a more editorial tone."
                    />
                </Field>
            </div>
        </SurfaceCard>
    );
}

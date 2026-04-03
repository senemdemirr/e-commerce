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
    onMaterialChange,
    onCareChange,
    onBulletPointsChange,
    onDescriptionLongChange,
    imageField,
}) {
    return (
        <SurfaceCard className="p-6 sm:p-8">
            <SectionIntro
                eyebrow="İçerik"
                title="Detay katmanını zenginleştirin"
                description="Uzun açıklama, materyal, bakım notları ve satışta öne çıkacak bullet point’ler ürünün ikna gücünü yükseltir."
                icon={<AutoAwesomeRoundedIcon />}
            />

            <div className="mt-8 grid gap-5 md:grid-cols-2">
                <Field label="Materyal">
                    <Input
                        value={materialValue}
                        onChange={onMaterialChange}
                        placeholder="%80 cotton, %20 polyester"
                    />
                </Field>

                {imageField}

                <Field label="Bakım notları" hint="Her satır ayrı kural">
                    <Textarea
                        rows={5}
                        value={careValue}
                        onChange={onCareChange}
                        placeholder={'30 derecede yikayin\nDusuk isiyle utuleyin\nKurutucu kullanmayin'}
                    />
                </Field>

                <Field label="Öne çıkan maddeler" hint="Her satır ayrı madde">
                    <Textarea
                        rows={5}
                        value={bulletPointsValue}
                        onChange={onBulletPointsChange}
                        placeholder={'Soft touch doku\nRelaxed fit kalip\nSezonlar arasi kullanima uygun'}
                    />
                </Field>
            </div>

            <div className="mt-5">
                <Field label="Uzun açıklama" hint="PDP hikayesi">
                    <Textarea
                        rows={6}
                        value={descriptionLongValue}
                        onChange={onDescriptionLongChange}
                        placeholder="Kumaş hissi, kullanım bağlamı ve ürünün stil avantajını daha editoryal bir tonda detaylandırın."
                    />
                </Field>
            </div>
        </SurfaceCard>
    );
}

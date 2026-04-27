import Link from "next/link";
import { Box, Button, Chip, IconButton, Tooltip } from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import EnergySavingsLeafIcon from "@mui/icons-material/EnergySavingsLeaf";
import LocalOfferRoundedIcon from "@mui/icons-material/LocalOfferRounded";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import { fetchHomepageCampaigns, fetchHomepageProducts } from "@/lib/homepage-data";

export const dynamic = "force-dynamic";

function formatPrice(price) {
  return `${Number(price || 0).toLocaleString("tr-TR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} TL`;
}

function formatCampaignDiscount(campaign) {
  const value = Number(campaign?.discount_value || 0);

  if (campaign?.discount_type === "percent") {
    return `%${value.toLocaleString("tr-TR", { maximumFractionDigits: 2 })}`;
  }

  return `${value.toLocaleString("tr-TR", {
    maximumFractionDigits: 2,
  })} TL`;
}

function productHref(product) {
  if (!product?.categorySlug || !product?.subCategorySlug || !product?.sku) {
    return "#";
  }

  return `/${product.categorySlug}/${product.subCategorySlug}/${product.sku}`;
}

function productImage(product) {
  return product?.image || "/just_logo.png";
}

function productAlt(product) {
  return `${product?.brand ? `${product.brand} ` : ""}${product?.title || "Product"}`;
}

function productSummary(product) {
  const bullet = product?.details?.bullet_point?.[0];
  return bullet || product?.description || "Premium product from the current catalog.";
}

function byTitle(products, value) {
  const normalizedValue = value.toLocaleLowerCase("tr-TR");
  return products.find((product) =>
    String(product.title || "").toLocaleLowerCase("tr-TR").includes(normalizedValue)
  );
}

function byExactTitle(products, value) {
  const normalizedValue = value.toLocaleLowerCase("tr-TR");
  return products.find(
    (product) =>
      String(product.title || "").toLocaleLowerCase("tr-TR") === normalizedValue
  );
}

const designProductTitles = [
  "Essential Linen Set",
  "Artisan Ceramic Vase",
  "Botanical Glow Oil",
  "PureSound Headset",
  "Cloud Runner Eco",
  "Luxury Soap Duo",
  "Performance Trainers",
  "Heritage Wristwatch",
  "Sienna Sunglasses",
  "Geo Table Lamp",
];

function pickHomepageProducts(products) {
  const sortedByPrice = [...products].sort(
    (left, right) => Number(right.price || 0) - Number(left.price || 0)
  );
  const designProducts = designProductTitles
    .map((title) => byExactTitle(products, title))
    .filter(Boolean);
  const heroProduct =
    byExactTitle(products, "Essential Linen Set") || designProducts[0] || products[0] || null;
  const campaignProduct =
    byExactTitle(products, "Geo Table Lamp") || designProducts[9] || products[1] || heroProduct;
  const editorProduct =
    byExactTitle(products, "Essential Linen Set") ||
    products.find((product) =>
      product?.details?.material?.some((item) =>
        String(item).toLocaleLowerCase("tr-TR").includes("organic")
      )
    ) || byTitle(products, "Oversize") || products[products.length - 1] || heroProduct;

  return {
    heroProduct,
    campaignProduct,
    editorProduct,
    trendingProducts: designProducts.length >= 5 ? designProducts.slice(0, 5) : sortedByPrice.slice(0, 5),
    arrivals: designProducts.length >= 10 ? designProducts.slice(5, 10) : products.slice(0, 5),
  };
}

function AddProductButton({ product }) {
  return (
    <Tooltip title={`View ${product.title}`} arrow>
      <IconButton
        component="a"
        href={productHref(product)}
        aria-label={`View ${product.title}`}
        className="!text-primary transition-transform hover:scale-110 hover:!bg-surface-container-high"
      >
        <AddCircleOutlineIcon />
      </IconButton>
    </Tooltip>
  );
}

function CampaignBar({ campaigns }) {
  if (!Array.isArray(campaigns) || campaigns.length === 0) {
    return null;
  }

  return (
    <Box component="section" className="container mx-auto pt-4">
      <div className="no-scrollbar scrollbar-hide flex items-start gap-9 overflow-x-auto">
        {campaigns.map((campaign) => {
          const discountLabel = formatCampaignDiscount(campaign);

          return (
            <Link
              key={campaign.id || campaign.code}
              href="#trending-products"
              prefetch={false}
              className="group flex min-w-[104px] max-w-[112px] flex-col items-center gap-2.5 text-center"
              aria-label={`${campaign.title} kampanyası: ${discountLabel} indirim, kod ${campaign.code}`}
              title={campaign.description || `${discountLabel} indirim - ${campaign.code}`}
            >
              <div className="relative flex h-[72px] w-[72px] items-center justify-center rounded-full bg-gradient-to-br from-mint-green to-champagne p-[2px] shadow-[0_8px_18px_rgba(17,24,39,0.10)] transition-transform group-hover:scale-105">
                <div className="flex h-full w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-white to-mint-green/10">
                  <LocalOfferRoundedIcon className="!text-[34px] text-primary drop-shadow-sm" />
                </div>
                <span className="absolute -bottom-1 rounded-full bg-primary-container px-2 py-0.5 text-[9px] font-black leading-none text-white shadow-sm">
                  Aktif
                </span>
              </div>
              <span className="line-clamp-2 min-h-[32px] text-[13px] font-bold leading-4 text-[#333333]">
                {campaign.title}
              </span>
            </Link>
          );
        })}
      </div>

    </Box>
  );
}

function ProductImage({ product, className = "" }) {
  return (
    <img
      className={`h-full w-full object-cover transition-transform duration-500 group-hover:scale-105 ${className}`}
      src={productImage(product)}
      alt={productAlt(product)}
    />
  );
}

function TrendingProductCard({ product, featured = false }) {
  if (featured) {
    return (
      <article className="group relative overflow-hidden rounded-xl border border-border-soft bg-surface transition-all duration-300 hover:shadow-xl md:col-span-2 md:row-span-2">
        <Link href={productHref(product)} prefetch={false} className="block">
          <div className="relative aspect-[4/5] overflow-hidden bg-white">
            <ProductImage product={product} />
            <span className="absolute left-4 top-4 rounded-full bg-primary-container px-3 py-1 text-[10px] font-bold text-white">
              BEST SELLER
            </span>
          </div>
        </Link>
        <div className="p-5 sm:p-6">
          <div className="mb-2 flex items-start justify-between gap-4">
            <Link href={productHref(product)} prefetch={false}>
              <h3 className="text-lg font-bold text-on-surface hover:text-primary">
                {product.title}
              </h3>
            </Link>
            <span className="shrink-0 font-bold text-primary">
              {formatPrice(product.price)}
            </span>
          </div>
          <p className="mb-4 line-clamp-2 text-sm text-outline">
            {productSummary(product)}
          </p>
          <Button
            component="a"
            href={productHref(product)}
            className="!w-full !rounded-lg !bg-surface-container-high !py-3 !font-bold !normal-case !text-on-surface !shadow-none transition-colors hover:!bg-primary-container hover:!text-white"
          >
            View Product
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="group overflow-hidden rounded-xl border border-border-soft bg-surface transition-all duration-300 hover:shadow-xl">
      <Link href={productHref(product)} prefetch={false} className="block">
        <div className="relative aspect-[4/5] overflow-hidden bg-white">
          <ProductImage product={product} />
          <span className="absolute left-3 top-3 rounded bg-secondary-fixed px-2 py-1 text-[10px] font-bold text-on-secondary-container">
            NEW
          </span>
        </div>
      </Link>
      <div className="p-4">
        <Link href={productHref(product)} prefetch={false}>
          <h3 className="truncate font-bold text-on-surface hover:text-primary" title={product.title}>
            {product.title}
          </h3>
        </Link>
        <p className="mt-1 truncate text-xs text-outline">{product.brand}</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-medium text-primary">{formatPrice(product.price)}</span>
          <AddProductButton product={product} />
        </div>
      </div>
    </article>
  );
}

function ArrivalCard({ product }) {
  return (
    <article className="group cursor-pointer">
      <Link href={productHref(product)} prefetch={false} className="block">
        <div className="relative mb-4 aspect-[3/4] overflow-hidden rounded-2xl bg-white">
          <ProductImage product={product} className="group-hover:scale-110" />
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-white/90 px-4 py-2 text-xs font-bold text-on-surface opacity-0 shadow-sm backdrop-blur transition-opacity group-hover:opacity-100 sm:px-6 sm:text-sm">
            Quick View
          </span>
        </div>
        <h4 className="truncate font-bold text-on-surface hover:text-primary" title={product.title}>
          {product.title}
        </h4>
        <p className="text-sm text-outline">{product.brand}</p>
        <p className="font-medium text-primary">{formatPrice(product.price)}</p>
      </Link>
    </article>
  );
}

function ProductColorSwatches({ product }) {
  const colors = Array.isArray(product?.colors) ? product.colors.slice(0, 4) : [];

  if (colors.length === 0) {
    return null;
  }

  return (
    <div className="mt-5 flex items-center gap-2">
      {colors.map((color) => (
        <span
          key={`${product.id}-${color.name}`}
          className="h-5 w-5 rounded-full border border-border-muted"
          style={{ backgroundColor: color.hex || "#ffffff" }}
          title={color.name}
        />
      ))}
    </div>
  );
}

export default async function Home() {
  const [products, campaigns] = await Promise.all([
    fetchHomepageProducts(),
    fetchHomepageCampaigns(),
  ]);
  const { heroProduct, campaignProduct, editorProduct, trendingProducts, arrivals } =
    pickHomepageProducts(products);

  if (!heroProduct) {
    return (
      <>
        <CampaignBar campaigns={campaigns} />
        <Box component="section" className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10">
          <div className="rounded-3xl bg-white p-12 text-center text-outline">
            No products found in the catalog.
          </div>
        </Box>
      </>
    );
  }

  return (
    <>
      <CampaignBar campaigns={campaigns} />

      <Box component="section" className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="group relative min-h-[560px] overflow-hidden rounded-3xl bg-surface-container-low lg:h-[600px]">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
          <img
            className="absolute inset-y-0 right-0 h-full w-full object-cover md:w-3/5"
            src={productImage(heroProduct)}
            alt={productAlt(heroProduct)}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
          <div className="relative z-10 flex h-full min-h-[560px] flex-col justify-center px-6 py-12 sm:px-12 lg:px-20">
            <Chip
              label={`${heroProduct.brand} • NEW SEASON`}
              className="!mb-6 !w-fit !rounded-full !bg-secondary-fixed !px-2 !font-bold !text-on-secondary-container"
            />
            <h1 className="mb-8 max-w-2xl text-5xl font-bold leading-none text-white sm:text-6xl lg:text-7xl">
              {heroProduct.title}
            </h1>
            <p className="mb-6 max-w-md text-lg leading-8 text-white">
              {heroProduct.description}
            </p>
            <ProductColorSwatches product={heroProduct} />
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                component="a"
                href={productHref(heroProduct)}
                variant="contained"
                className="!rounded-full !bg-primary-container !px-8 !py-4 !font-bold !normal-case !text-white !shadow-none transition-all hover:scale-[1.02] hover:!bg-primary"
              >
                View Product
              </Button>
              <Button
                component="a"
                href="#trending-products"
                variant="outlined"
                startIcon={<PlayCircleOutlineIcon />}
                className="!rounded-full !border-white/30 !bg-white/20 !px-8 !py-4 !font-bold !normal-case !text-white !shadow-none !backdrop-blur-md transition-colors hover:!border-white/40 hover:!bg-white/30"
              >
                Explore Collection
              </Button>
            </div>
          </div>
        </div>
      </Box>

      <Box
        id="trending-products"
        component="section"
        className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10"
      >
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-on-surface">
              Trending Now
            </h2>
            <p className="text-outline">Top products from the current catalog</p>
          </div>
          <Link className="shrink-0 font-bold text-primary hover:underline" href="/home-living">
            View All
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-4">
          {trendingProducts.map((product, index) => (
            <TrendingProductCard
              key={product.id}
              product={product}
              featured={index === 0}
            />
          ))}
        </div>
      </Box>

      <Box component="section" className="mx-auto max-w-[1440px] px-4 py-10 sm:px-6 lg:px-10">
        <div className="relative flex flex-col items-center justify-between overflow-hidden rounded-3xl bg-secondary-fixed px-6 py-16 sm:px-10 md:flex-row lg:px-16 lg:py-20">
          <div className="z-10 md:max-w-xl">
            <span className="mb-3 block text-xs font-bold uppercase text-on-secondary-container">
              Featured Product
            </span>
            <h2 className="mb-4 text-4xl font-bold leading-tight text-on-secondary-container sm:text-5xl">
              {campaignProduct.title}
            </h2>
            <p className="mb-8 text-lg leading-8 text-on-secondary-fixed-variant">
              {productSummary(campaignProduct)}
            </p>
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <Button
                component="a"
                href={productHref(campaignProduct)}
                className="!rounded-full !bg-primary !px-10 !py-4 !font-bold !normal-case !text-white !shadow-none hover:!bg-primary-dark"
              >
                Shop Product
              </Button>
              <div className="flex flex-col">
                <span className="mb-1 text-xs font-bold uppercase text-on-secondary-container">
                  PRICE
                </span>
                <span className="w-fit border-b-2 border-dashed border-on-secondary-container text-2xl font-bold text-on-secondary-container">
                  {formatPrice(campaignProduct.price)}
                </span>
              </div>
            </div>
          </div>
          <div className="relative mt-12 flex w-full justify-center md:mt-0 md:w-1/2">
            <div className="relative">
              <img
                className="relative z-10 h-96 w-72 rotate-3 rounded-2xl object-cover shadow-2xl sm:w-80"
                src={productImage(campaignProduct)}
                alt={productAlt(campaignProduct)}
              />
              <div className="absolute -left-6 -top-6 h-full w-full -rotate-6 rounded-2xl bg-white/30" />
            </div>
          </div>
        </div>
      </Box>

      <Box component="section" className="mx-auto max-w-[1440px] rounded-t-[3rem] bg-surface-container-low px-4 py-20 sm:px-6 lg:px-10">
        <div className="mb-16 text-center">
          <span className="text-xs font-bold uppercase text-primary">
            Fresh Picks
          </span>
          <h2 className="mt-2 text-4xl font-bold text-on-surface">
            New Arrivals
          </h2>
        </div>
        <div className="grid grid-cols-2 gap-gutter lg:grid-cols-5">
          {arrivals.map((product) => (
            <ArrivalCard key={product.id} product={product} />
          ))}
        </div>
      </Box>

      <Box component="section" className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10">
        <div className="grid grid-cols-1 items-center gap-gutter md:grid-cols-12">
          <div className="md:col-span-7">
            <div className="relative h-[500px] overflow-hidden rounded-3xl bg-white">
              <img
                className="h-full w-full object-cover"
                src={productImage(editorProduct)}
                alt={productAlt(editorProduct)}
              />
              <div className="absolute bottom-6 left-6 max-w-sm rounded-2xl bg-white/90 p-6 shadow-lg backdrop-blur-md sm:bottom-10 sm:left-10 sm:p-8">
                <h3 className="mb-2 text-xl font-bold text-on-surface">
                  {editorProduct.title}
                </h3>
                <p className="mb-4 line-clamp-3 text-sm text-outline">
                  {productSummary(editorProduct)}
                </p>
                <Link
                  className="inline-flex items-center gap-2 font-bold text-primary"
                  href={productHref(editorProduct)}
                  prefetch={false}
                >
                  Explore product
                  <ArrowForwardIcon className="!text-base" />
                </Link>
              </div>
            </div>
          </div>
          <div className="space-y-gutter md:col-span-5">
            <div className="rounded-3xl bg-primary-container/20 p-8 sm:p-10">
              <h2 className="mb-4 text-3xl font-bold text-on-primary-container">
                The Editor's Choice
              </h2>
              <p className="mb-6 text-lg leading-8 text-on-primary-container/80">
                {editorProduct.brand} brings together catalog quality,
                available variants and current product details from your site.
              </p>
              <Button
                component="a"
                href={productHref(editorProduct)}
                className="!rounded-full !bg-primary !px-8 !py-4 !font-bold !normal-case !text-white !shadow-none hover:!bg-primary-dark"
              >
                Read Details
              </Button>
            </div>
            <div className="flex gap-4">
              <div className="flex aspect-square w-1/2 flex-col items-center justify-center rounded-2xl border border-border-soft bg-surface p-4 text-center">
                <EnergySavingsLeafIcon className="!mb-2 !text-4xl !text-primary" />
                <h4 className="font-bold text-on-surface">Catalog Product</h4>
              </div>
              <div className="flex aspect-square w-1/2 flex-col items-center justify-center rounded-2xl border border-border-soft bg-surface p-4 text-center">
                <VerifiedUserIcon className="!mb-2 !text-4xl !text-primary" />
                <h4 className="font-bold text-on-surface">Live Variants</h4>
              </div>
            </div>
          </div>
        </div>
      </Box>
    </>
  );
}

import { Button, IconButton } from "@mui/material";
import AlternateEmailIcon from "@mui/icons-material/AlternateEmail";
import PublicIcon from "@mui/icons-material/Public";

export default function Footer() {
  return (
    <footer className="mt-auto w-full border-t border-border-muted bg-border-soft dark:border-gray-800 dark:bg-background-dark">
      <div className="mx-auto grid w-full max-w-[1440px] grid-cols-1 gap-12 px-6 py-16 text-sm leading-6 sm:px-10 md:grid-cols-4">
        <div>
          <div className="mb-4 text-xl font-bold text-primary">MintShop</div>
          <p className="mb-6 text-outline dark:text-gray-400">
            Curating conscious products for a modern, organic lifestyle. Join
            our journey towards sustainability.
          </p>
          <div className="flex gap-4">
            <IconButton
              component="a"
              href="#"
              aria-label="Website"
              className="!h-10 !w-10 !bg-white !text-primary transition-all hover:!bg-primary hover:!text-white"
            >
              <PublicIcon />
            </IconButton>
            <IconButton
              component="a"
              href="#"
              aria-label="Email"
              className="!h-10 !w-10 !bg-white !text-primary transition-all hover:!bg-primary hover:!text-white"
            >
              <AlternateEmailIcon />
            </IconButton>
          </div>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase text-on-surface dark:text-white">
            Shop
          </h4>
          <ul className="space-y-4">
            {["New Arrivals", "Bestsellers", "Home Decor", "Sustainable Tech"].map(
              (item) => (
                <li key={item}>
                  <a
                    className="text-outline underline-offset-4 hover:text-primary dark:text-gray-400"
                    href="#"
                  >
                    {item}
                  </a>
                </li>
              )
            )}
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase text-on-surface dark:text-white">
            Support
          </h4>
          <ul className="space-y-4">
            {[
              "Shipping & Returns",
              "Contact Us",
              "Sustainability Policy",
              "Terms of Service",
            ].map((item) => (
              <li key={item}>
                <a
                  className="text-outline underline-offset-4 hover:text-primary dark:text-gray-400"
                  href="#"
                >
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="mb-6 text-xs font-bold uppercase text-on-surface dark:text-white">
            Newsletter
          </h4>
          <p className="mb-4 text-outline dark:text-gray-400">
            Subscribe for conscious living tips and exclusive offers.
          </p>
          <div className="flex flex-col gap-2">
            <input
              className="w-full rounded-lg border border-border-muted bg-white px-4 py-2 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
              placeholder="your@email.com"
              type="email"
            />
            <Button className="!w-full !rounded-lg !bg-primary !py-2 !font-bold !normal-case !text-white !shadow-none hover:!bg-primary-dark">
              Subscribe
            </Button>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col items-center justify-between gap-4 border-t border-border-muted px-6 py-8 sm:px-10 md:flex-row">
        <p className="text-xs text-outline">
          © 2026 IronEcommerce. Conscious Living. All Rights Reserved.
        </p>
        <div className="flex gap-6">
          <a className="text-xs text-outline hover:text-primary" href="#">
            Privacy Policy
          </a>
          <a className="text-xs text-outline hover:text-primary" href="#">
            Cookie Settings
          </a>
        </div>
      </div>
    </footer>
  );
}

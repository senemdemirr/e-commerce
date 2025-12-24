export default function Footer() {
  return (
    <footer className="fixed bottom-0 w-full bg-white border-t border-gray-200 text-center py-4">
      <p className="text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Iron e-commerce. All rights reserved.
      </p>
    </footer>
  );
}
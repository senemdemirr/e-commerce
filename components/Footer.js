export default function Footer() {
  return (
    <footer className="bg-gray-100 text-center py-4">
      <p className="text-sm text-gray-600">
        &copy; {new Date().getFullYear()} Iron e-commerce. All rights reserved.
      </p>
    </footer>
  );
}
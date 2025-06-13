// components/Footer.tsx
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-white py-6 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Rubber Authority of Thailand Logo"
              width={40}
              height={40}
              className="mr-2"
            />
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} การยางแห่งประเทศไทย. สงวนลิขสิทธิ์.
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                นโยบายความเป็นส่วนตัว
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                เงื่อนไขการใช้งาน
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                ติดต่อเรา
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

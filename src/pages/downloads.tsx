import { type NextPage } from "next";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { BottomBar } from "~/components/BottomBar";
import Link from "next/link";
import {
    Dropdown,
    makeStyles,
    Option,
    useId,
  } from "@fluentui/react-components";
  import type { DropdownProps } from "@fluentui/react-components";

const Downloads: NextPage = () => {
    function closeDropdown(event: MouseEvent<HTMLAnchorElement, MouseEvent>): void {
        throw new Error("Function not implemented.");
    }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Contenedor principal */}
      <div className="flex flex-1">
        <LeftBar />
        <main className="flex-1 p-4">
          <h1 className="text-2xl font-bold">Downloads Page</h1>
          <p>Aquí puedes descargar archivos.</p>
          <Link href="/" className="text-blue-500 underline">
            Volver a inicio
          </Link>
          <div className="mx-auto p-4 absolute right-0 mt-2 w-44 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <ul role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                            <li>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={closeDropdown}
                                >
                                    Option 1
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={closeDropdown}
                                >
                                    Option 2
                                </a>
                            </li>
                            <li>
                                <a
                                    href="#"
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                    onClick={closeDropdown}
                                >
                                    Option 3
                                </a>
                            </li>
                        </ul>
                    </div>
        </main>
        <RightBar />
      </div>
      <BottomBar />
    </div>
  );
};

export default Downloads;
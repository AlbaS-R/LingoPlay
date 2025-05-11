import { NextPage } from "next";
import Link from "next/link";
import { Button, Grow, Paper, Popper, MenuItem, MenuList, ClickAwayListener } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { BottomBar } from "~/components/BottomBar";
import { ReactNode } from "react";
import type { Tile, TileType, Unit } from "~/utils/units";
import { units } from "~/utils/units";


const UnitHeader = ({
  unitName,
  unitNumber,
  description,
  backgroundColor,
  borderColor,
  children,
}: {
  unitName: string;
  unitNumber: number;
  description: string;
  backgroundColor: `bg-${string}`;
  borderColor: `border-${string}`;
  children?: ReactNode;
}) => {
  return (
    <article
      className={["max-w-4xl w-full text-white sm:rounded-xl mb-8", backgroundColor, borderColor].join(" ")}
    >
      <header className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{unitName}</h2>
          <p className="text-sm">{description}</p>
        </div>
      </header>
      {children && <div className="p-4">{children}</div>}
    </article>
  );
};

const Downloads: NextPage = () => {
  const MenuListComposition = ({ label }: { label: string }) => {
    const [open, setOpen] = useState(false);
    const anchorRef = useRef<HTMLButtonElement>(null);

    const handleToggle = () => setOpen((prevOpen) => !prevOpen);
    const handleClose = (event: Event | React.SyntheticEvent) => {
      if (
        anchorRef.current &&
        anchorRef.current.contains(event.target as HTMLElement)
      ) return;
      setOpen(false);
    };

    function handleListKeyDown(event: React.KeyboardEvent) {
      if (event.key === "Tab" || event.key === "Escape") setOpen(false);
    }

    const prevOpen = useRef(open);
    useEffect(() => {
      if (prevOpen.current && !open) anchorRef.current?.focus();
      prevOpen.current = open;
    }, [open]);

    return (

      <div>
        <Button
          ref={anchorRef}
          onClick={handleToggle}
          className="bg-blue-600 text-white font-bold hover:bg-blue-700"
          disableElevation
          variant="contained"
        >
          {label}
        </Button>
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom"
          transition
          disablePortal
        >
          {({ TransitionProps }) => (
            <Grow
              {...TransitionProps}
              style={{ transformOrigin: "center top" }}
            >
              <Paper>
                <ClickAwayListener onClickAway={handleClose}>
                  <MenuList
                    autoFocusItem={open}
                    onKeyDown={handleListKeyDown}
                    className="grid grid-cols-2 gap-2"
                  >
                    <MenuItem onClick={handleClose}>Exercici 1</MenuItem>
                    <MenuItem onClick={handleClose}>Exercici 2</MenuItem>
                    <MenuItem onClick={handleClose}>Exercici 3</MenuItem>
                    <MenuItem onClick={handleClose}>Exercici 4</MenuItem>
                    <MenuItem onClick={handleClose}>Exercici 5</MenuItem>
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex flex-col md:flex-row flex-1">
        <LeftBar />

        <main className="flex justify-center gap-3 pt-14 sm:p-6 sm:pt-10 md:ml-24 lg:ml-64 lg:gap-12 flex-1">
          <div className="flex max-w-4xl w-full flex-col">
            <h1 className="text-2xl font-bold mb-2">Downloads Page</h1>
            <p className="mb-4">Aquí puedes descargar archivos.</p>
            <Link href="/" className="text-blue-500 underline mb-6 block">
              Volver a inicio
            </Link>

            <div className="flex flex-col space-y-6">
              <UnitHeader
                unitName="Jocs de memòria"
                unitNumber={1}
                description="Una breve descripción de la unidad 1."
                backgroundColor="bg-blue-200"
                borderColor="border-blue-300"
              >
                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition label="Descarrega" />
                </div>
              </UnitHeader>

              <UnitHeader
                unitName="Jocs de lògica"
                unitNumber={2}
                description="Una breve descripción de la unidad 2."
                backgroundColor="bg-blue-300"
                borderColor="border-blue-400"
              >
                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition label="Descarrega" />
                </div>
              </UnitHeader>

              <UnitHeader
                unitName="Dictats auditivos"
                unitNumber={3}
                description="Una breve descripción de la unidad 3."
                backgroundColor="bg-blue-400"
                borderColor="border-blue-600"
              >
                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition label="Descarrega" />
                </div>
              </UnitHeader>

              <UnitHeader
                unitName="Puzzles visuals"
                unitNumber={4}
                description="Una breve descripción de la unidad 4."
                backgroundColor="bg-blue-500"
                borderColor="border-blue-700"
              >
                <div className="flex justify-end mt-4 pr-6 space-x-4">
                  <MenuListComposition label="Descarrega" />
                </div>
              </UnitHeader>
            </div>
          </div>
        </main>

        <RightBar />
      </div>

      <BottomBar />
    </div>
  );
};

export default Downloads;

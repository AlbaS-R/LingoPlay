import { NextPage } from "next";
import Link from "next/link";
import { Button, Grow, Paper, Popper, MenuItem, MenuList, ClickAwayListener } from "@mui/material";
import { useState, useRef, useEffect } from "react";
import { LeftBar } from "~/components/LeftBar";
import { RightBar } from "~/components/RightBar";
import { BottomBar } from "~/components/BottomBar";
import type { Tile, TileType, Unit } from "~/utils/units";
import { units } from "~/utils/units";


const UnitHeader = ({
  unitName,
  unitNumber,
  description,
  backgroundColor,
  borderColor,
}: {
  unitName: string;
  unitNumber: number;
  description: string;
  backgroundColor: `bg-${string}`;
  borderColor: `border-${string}`;
}) => {
  return (
    <article
      className={["max-w-2xl text-white sm:rounded-xl", backgroundColor, borderColor].join(" ")}
    >
      <header className="flex items-center justify-between gap-4 p-4">
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{unitName}</h2>
        </div>
      </header>
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
          aria-controls={open ? "menu-list" : undefined}
          aria-expanded={open ? "true" : undefined}
          aria-haspopup="true"
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
      <div className="flex flex-1">
        <LeftBar />
        <main className="flex-1 p-4">
          <h1 className="text-2xl font-bold">Downloads Page</h1>
          <p>Aquí puedes descargar archivos.</p>
          <Link href="/" className="text-blue-500 underline">Volver a inicio</Link>

          <div className="flex justify-center mt-6 space-x-4">
            <MenuListComposition label="Jocs de memòria" />
            <MenuListComposition label="Jocs de lògica" />
            <MenuListComposition label="Puzzles visuals" />
            <MenuListComposition label="Dictats auditivos" />
          </div>

          <div className="mt-8">
            <UnitHeader
              unitName="Unitat 1"
              unitNumber={1}
              description="Una breve descripción de la unidad 1."
              backgroundColor="bg-blue-500"
              borderColor="border-blue-700"
            />
            <UnitHeader
              unitName="Unitat 2"
              unitNumber={2}
              description="Una breve descripción de la unidad 2."
              backgroundColor="bg-green-500"
              borderColor="border-green-700"
            />
            <UnitHeader
              unitName="Unitat 3"
              unitNumber={3}
              description="Una breve descripción de la unidad 3."
              backgroundColor="bg-red-500"
              borderColor="border-red-700"
            />
          </div>
        </main>
        <RightBar />
      </div>
      <BottomBar />
    </div>
  );
};

export default Downloads;

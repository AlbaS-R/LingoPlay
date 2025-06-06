import Link from "next/link";
import type { ComponentProps } from "react";
import React, { useState, useEffect } from "react";
import type { Tab } from "./BottomBar";
import { useBottomBarItems } from "./BottomBar";
import type { LoginScreenState } from "./LoginScreen";
import { LoginScreen } from "./LoginScreen";
import { GlobeIconSvg, PodcastIconSvg } from "./Svgs";
import { useBoundStore } from "~/hooks/useBoundStore";
import { useRouter } from "next/router";

const LeftBarMoreMenuSvg = (props: ComponentProps<"svg">) => {
  return (
    <svg width="46" height="46" viewBox="0 0 46 46" fill="none" {...props}>
      <circle
        cx="23"
        cy="23"
        r="19"
        fill="#CE82FF"
        stroke="#CE82FF"
        strokeWidth="2"
      />
      <circle cx="15" cy="23" r="2" fill="white" />
      <circle cx="23" cy="23" r="2" fill="white" />
      <circle cx="31" cy="23" r="2" fill="white" />
    </svg>
  );
};

export const LeftBar = ({ selectedTab }: { selectedTab?: Tab }) => {
  const router = useRouter();
  const loggedIn = useBoundStore((x) => x.loggedIn);
  const logOut = useBoundStore((x) => x.logOut);
  const [moreMenuShown, setMoreMenuShown] = useState(false);
  const [loginScreenState, setLoginScreenState] =
    useState<LoginScreenState>("HIDDEN");
  const [activeTab, setActiveTab] = useState<Tab | null>(null);
  const bottomBarItems = useBottomBarItems();

  useEffect(() => {
    const updateActiveTab = () => {
      const currentPath = router.asPath.split("?")[0];
      const matchingItem = bottomBarItems.find((item) => {
        const itemBasePath = item.href.split("?")[0];
        return currentPath === itemBasePath;
      });
      setActiveTab(matchingItem?.name ?? selectedTab ?? null);
    };

    updateActiveTab();
    router.events.on("routeChangeComplete", updateActiveTab);

    return () => {
      router.events.off("routeChangeComplete", updateActiveTab);
    };
  }, [router, selectedTab, bottomBarItems]);

  return (
    <>
      <nav className="fixed bottom-0 left-0 top-0 hidden flex-col gap-5 border-r-2 border-[#e5e5e5] bg-[#235390] p-3 md:flex lg:w-64 lg:p-5">
        <Link
          href="/learn"
          className="mb-5 ml-5 mt-5 hidden text-3xl font-bold text-white lg:block"
        >
          LingoPlay
        </Link>
        <ul className="flex flex-col items-stretch gap-3">
          {bottomBarItems.map((item) => {
            const isActive = activeTab === item.name;
            return (
              <li key={item.name} className="flex flex-1">
                <Link
                  href={item.href}
                  className={`flex min-h-[44px] grow items-center gap-3 rounded-xl px-2 py-1 text-sm font-bold uppercase transition-colors duration-200 ${
                    isActive
                      ? "border-2 border-[#84d8ff] bg-[#ddf4ff] text-blue-400"
                      : "border-2 border-transparent text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {React.cloneElement(item.icon, { className: "h-6 w-6" })}
                  <span className="sr-only lg:not-sr-only">{item.name}</span>
                </Link>
              </li>
            );
          })}

          <li className="flex flex-1">
            <div
              className={`relative flex min-h-[44px] grow items-center gap-3 rounded-xl px-2 py-1 text-sm font-bold uppercase transition-colors duration-200 ${
                moreMenuShown
                  ? "border-2 border-[#84d8ff] bg-[#ddf4ff] text-blue-400"
                  : "border-2 border-transparent text-gray-400 hover:bg-gray-100"
              }`}
              onClick={() => setMoreMenuShown((x) => !x)}
              onMouseEnter={() => setMoreMenuShown(true)}
              onMouseLeave={() => setMoreMenuShown(false)}
              role="button"
              tabIndex={0}
            >
              <LeftBarMoreMenuSvg className="h-6 w-6" />
              <span className="hidden text-sm lg:inline">More</span>
              <div
                className={`absolute left-[88px] top-0 z-50 min-w-[300px] rounded-2xl border-2 border-gray-300 bg-white text-left text-gray-400 shadow-xl ${
                  moreMenuShown ? "" : "hidden"
                }`}
              >
                <div className="flex flex-col py-2">
                  <Link
                    className="flex items-center gap-4 px-5 py-2 text-left uppercase hover:bg-gray-100"
                    href="https://schools.duolingo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <GlobeIconSvg className="h-10 w-10" />
                    Schools
                  </Link>
                  <Link
                    className="flex items-center gap-4 px-5 py-2 text-left uppercase hover:bg-gray-100"
                    href="https://podcast.duolingo.com"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <PodcastIconSvg className="h-10 w-10" />
                    Podcast
                  </Link>
                </div>
                <div className="flex flex-col border-t-2 border-gray-300 py-2">
                  {!loggedIn && (
                    <button
                      className="px-5 py-2 text-left uppercase hover:bg-gray-100"
                      onClick={() => setLoginScreenState("SIGNUP")}
                    >
                      Create a profile
                    </button>
                  )}
                  <Link
                    className="px-5 py-2 text-left uppercase hover:bg-gray-100"
                    href={loggedIn ? "/settings/account" : "/settings/sound"}
                  >
                    Settings
                  </Link>
                  <Link
                    className="px-5 py-2 text-left uppercase hover:bg-gray-100"
                    href="https://support.duolingo.com/hc/en-us"
                  >
                    Help
                  </Link>
                  {!loggedIn && (
                    <button
                      className="px-5 py-2 text-left uppercase hover:bg-gray-100"
                      onClick={() => setLoginScreenState("LOGIN")}
                    >
                      Sign in
                    </button>
                  )}
                  {loggedIn && (
                    <button
                      className="px-5 py-2 text-left uppercase hover:bg-gray-100"
                      onClick={logOut}
                    >
                      Sign out
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </nav>
      <LoginScreen
        loginScreenState={loginScreenState}
        setLoginScreenState={setLoginScreenState}
      />
    </>
  );
};

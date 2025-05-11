import Link from "next/link";
import { useBoundStore } from "~/hooks/useBoundStore";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

type BottomBarItem = {
  name: Tab;
  href: string;
  icon: JSX.Element;
};

export type Tab = "Exercises" | "Downloads" | "Profile" | "Multiplayer" | "Leaderboards";

export const useBottomBarItems = () => {
  const loggedIn = useBoundStore((x) => x.loggedIn);

  const bottomBarItems: BottomBarItem[] = [
    {
      name: "Exercises",
      href: "/learn",
      icon: (
        <svg
          width="32"
          height="32"
          viewBox="0 0 32 32"
          fill="none"
          className="h-[50px] w-[50px]"
        >
          <path
            d="M24.5852 25.2658C24.2883 26.8243 22.9257 27.9519 21.3392 27.9519H10.6401C9.05354 27.9519 7.69094 26.8243 7.39408 25.2658L4.98096 12.5969L15.9001 4.52225L26.9988 12.5941L24.5852 25.2658Z"
            fill="#FFC800"
          />
          <path
            opacity="0.5"
            fillRule="evenodd"
            clipRule="evenodd"
            d="M13.1558 23.1111C13.1558 22.522 13.6333 22.0444 14.2224 22.0444H18.4891C19.0782 22.0444 19.5558 22.522 19.5558 23.1111C19.5558 23.7002 19.0782 24.1778 18.4891 24.1778H14.2224C13.6333 24.1778 13.1558 23.7002 13.1558 23.1111Z"
            fill="#945151"
          />
          <path
            d="M19.4785 16.2998C19.4785 18.2208 17.9212 19.778 16.0002 19.778C14.0792 19.778 12.522 18.2208 12.522 16.2998C12.522 14.3788 14.0792 12.8215 16.0002 12.8215C17.9212 12.8215 19.4785 14.3788 19.4785 16.2998Z"
            fill="#945151"
          />
          <path
            d="M16.1685 2.84462C16.6431 2.84231 17.1233 2.98589 17.5361 3.28558L17.5368 3.2861L29.9455 12.2319C30.9781 12.9822 31.207 14.4275 30.4568 15.4601C29.7067 16.4924 28.262 16.7215 27.2294 15.9719L27.2286 15.9714L16.1602 7.99185L5.09208 15.9712L5.09121 15.9719C4.05865 16.7213 2.61395 16.4923 1.86391 15.4599C1.11367 14.4273 1.34258 12.982 2.3752 12.2318L2.37679 12.2306L14.7839 3.28596L14.7846 3.28544C15.2022 2.98229 15.6887 2.83889 16.1685 2.84462Z"
            fill="#FF4B4B"
          />
        </svg>
      ),
    },
    {
      name: "Downloads",
      href: loggedIn ? "/downloads" : "/learn?sign-up",
      icon: (
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          fill="none"
          className="h-[50px] w-[50px]"
        >
          <rect x="6" y="36" width="34" height="4" rx="2" fill="#A56644" />
          <path
            d="M23 6C21.8954 6 21 6.89543 21 8V25.17L16.41 20.59C15.63 19.81 14.37 19.81 13.59 20.59C12.81 21.37 12.81 22.63 13.59 23.41L21.59 31.41C22.37 32.19 23.63 32.19 24.41 31.41L32.41 23.41C33.19 22.63 33.19 21.37 32.41 20.59C31.63 19.81 30.37 19.81 29.59 20.59L25 25.17V8C25 6.89543 24.1046 6 23 6Z"
            fill="#FF4945"
          />
          <path
            d="M10 36C10 34.3431 11.3431 33 13 33H33C34.6569 33 36 34.3431 36 36V38C36 39.6569 34.6569 41 33 41H13C11.3431 41 10 39.6569 10 38V36Z"
            fill="#B9E8FF"
          />
        </svg>
      ),
    },
    {
      name: "Profile",
      href: loggedIn ? "/profile" : "/learn?sign-up",
      icon: (
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          fill="none"
          className="h-[50px] w-[50px]"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M23.1826 5.00195C14.3461 5.00195 7.18262 12.1654 7.18262 21.002V21.9375C4.21918 23.4102 2.18262 26.4682 2.18262 30.002C2.18262 34.9725 6.21206 39.002 11.1826 39.002H35.1826C40.1532 39.002 44.1826 34.9725 44.1826 30.002C44.1826 26.4682 42.1461 23.4102 39.1826 21.9375V21.002C39.1826 12.1654 32.0192 5.00195 23.1826 5.00195Z"
            fill="#9069CD"
          />
          <path
            d="M11.1826 21.002C11.1826 14.3745 16.5552 9.00195 23.1826 9.00195C29.81 9.00195 35.1826 14.3745 35.1826 21.002V29.002C35.1826 35.6294 29.81 41.002 23.1826 41.002C16.5552 41.002 11.1826 35.6294 11.1826 29.002V21.002Z"
            fill="#F3AD6D"
          />
          <path
            d="M7.18262 24.502C7.18262 22.0167 9.19734 20.002 11.6826 20.002H34.6826C37.1679 20.002 39.1826 22.0167 39.1826 24.502C39.1826 26.9872 37.1679 29.002 34.6826 29.002H11.6826C9.19734 29.002 7.18262 26.9872 7.18262 24.502Z"
            fill="#F3AD6D"
          />
          <path
            d="M18.1826 20.502C18.1826 19.6735 18.8542 19.002 19.6826 19.002C20.511 19.002 21.1826 19.6735 21.1826 20.502V24.502C21.1826 25.3304 20.511 26.002 19.6826 26.002C18.8542 26.002 18.1826 25.3304 18.1826 24.502V20.502Z"
            fill="#BF8034"
          />
          <path
            d="M24.1826 20.502C24.1826 19.6735 24.8542 19.002 25.6826 19.002C26.511 19.002 27.1826 19.6735 27.1826 20.502V24.502C27.1826 25.3304 26.511 26.002 25.6826 26.002C24.8542 26.002 24.1826 25.3304 24.1826 24.502V20.502Z"
            fill="#BF8034"
          />
          <path
            d="M17.1826 29.0445C17.1826 28.4687 17.6494 28.002 18.2252 28.002H27.1401C27.7159 28.002 28.1826 28.4687 28.1826 29.0445V29.502C28.1826 32.5395 25.7202 35.002 22.6826 35.002C19.6451 35.002 17.1826 32.5395 17.1826 29.502V29.0445Z"
            fill="white"
          />
          <path
            d="M7.18262 21.0062V21.002C7.18262 12.1654 14.3461 5.00195 23.1826 5.00195C26.0199 5.00195 28.6847 5.74049 30.9953 7.0358C29.7326 15.5 22.2386 22.002 13.1826 22.002C11.0788 22.002 9.05929 21.6511 7.18262 21.0062Z"
            fill="#9069CD"
          />
        </svg>
      ),
    },
    {
      name: "Multiplayer",
      href: loggedIn ? "/multiplayer" : "/learn?sign-up",
      icon: (
        <svg
          width="46"
          height="46"
          viewBox="0 0 46 46"
          fill="none"
          className="h-[50px] w-[50px]"
        >
          <rect x="6" y="36" width="34" height="4" rx="2" fill="#A56644" />
          <circle cx="16" cy="16" r="4" fill="#FF4945" />
          <circle cx="30" cy="16" r="4" fill="#FF4945" />
          <path
            d="M12 26C12 23.7909 13.7909 22 16 22H16C18.2091 22 20 23.7909 20 26V28H12V26Z"
            fill="#B9E8FF"
          />
          <path
            d="M26 26C26 23.7909 27.7909 22 30 22H30C32.2091 22 34 23.7909 34 26V28H26V26Z"
            fill="#B9E8FF"
          />
        </svg>
      ),
    },
  ];


  return bottomBarItems;
};

type BottomBarProps = {
  selectedTab?: Tab;
};

export const BottomBar = ({ selectedTab }: BottomBarProps) => {
  const router = useRouter();
  const bottomBarItems = useBottomBarItems();
  const [activeTab, setActiveTab] = useState<Tab | null>(null);

  useEffect(() => {
    const updateActiveTab = () => {
      const currentPath = router.asPath.split("?")[0];

      const matchingItem = bottomBarItems.find((item) => {
        const itemBasePath = item.href.split("?")[0];
        return currentPath === itemBasePath;
      });

      if (matchingItem) {
        setActiveTab(matchingItem.name);
      } else if (selectedTab) {
        setActiveTab(selectedTab);
      } else {
        setActiveTab(null);
      }
    };

    updateActiveTab();
    const handleRouteChange = () => {
      updateActiveTab();
    };

    router.events.on("routeChangeComplete", handleRouteChange);

    return () => {
      router.events.off("routeChangeComplete", handleRouteChange);
    };
  }, [router, selectedTab, bottomBarItems]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-20 border-t-2 border-[#e5e5e5] bg-white md:hidden">
      <ul className="flex h-[88px]">
        {bottomBarItems.map((item) => (
          <li
            key={item.name}
            className="flex flex-1 items-center justify-center"
          >
            <Link
              href={item.href}
              className={`flex min-h-[44px] grow items-center justify-center gap-3 rounded-xl px-2 py-1 text-sm font-bold uppercase transition-colors duration-200 ${activeTab === item.name
                ? "border-2 border-[#84d8ff] bg-[#ddf4ff] text-blue-400"
                : "border-2 border-transparent text-gray-400 hover:bg-gray-100"
                } `}
              onClick={() => setActiveTab(item.name)}
            >
              {item.icon}
              <span className="sr-only">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
};

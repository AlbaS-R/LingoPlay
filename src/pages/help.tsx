
import Link from "next/link";
import { BookOpen, UserCog, LogIn, Languages, Search } from "lucide-react";
import { useState } from "react";

export default function HelpPage() {
  const allItems = [
    {
      title: "Getting Started",
      desc: "Learn how to create your profile, start exercises, and track your XP.",
      link: "/help/getting-started",
      icon: <BookOpen className="h-6 w-6 text-[#235390]" />,
    },
    {
      title: "Account Issues",
      desc: "Recover your password, manage your login methods, and update your info.",
      link: "/help/account",
      icon: <UserCog className="h-6 w-6 text-[#235390]" />,
    },
    {
      title: "Google Login",
      desc: "Troubleshooting sign-in problems with Google and setting it up correctly.",
      link: "/help/google-login",
      icon: <LogIn className="h-6 w-6 text-[#235390]" />,
    },
    {
      title: "Language Settings",
      desc: "Change your learning language or update language preferences.",
      link: "/help/language",
      icon: <Languages className="h-6 w-6 text-[#235390]" />,
    },
  ];

  const [query, setQuery] = useState("");

  const filteredItems = allItems.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <main className="min-h-screen bg-white py-12 px-6 text-gray-800">
      <section className="max-w-6xl mx-auto">
        {/* LOGO */}
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-extrabold text-[#235390]">LingoPlay</h1>
          <span className="text-sm text-gray-500">Help Center</span>
        </div>

        {/* Barra de cerca */}
        <div className="relative max-w-md mb-10">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search help topics..."
            className="w-full rounded-2xl border border-blue-300 bg-gray-100 px-4 py-2 text-sm text-gray-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <Search className="absolute right-3 top-2.5 h-4 w-4 text-gray-500" />
        </div>

        {/* Targetes filtrades */}
        <div className="grid sm:grid-cols-2 gap-8">
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => (
              <div
                key={index}
                className="bg-white hover:bg-blue-50 transition transform hover:-translate-y-1 hover:shadow-lg text-left rounded-3xl shadow-md p-6 border border-blue-100"
              >
                <div className="flex items-center gap-3 mb-4">
                  {item.icon}
                  <h2 className="text-xl font-bold text-[#235390]">{item.title}</h2>
                </div>
                <p className="text-sm text-gray-600 mb-4">{item.desc}</p>
                <Link
                  href={item.link}
                  className="inline-block text-blue-600 font-semibold hover:text-blue-800 transition"
                >
                  Read more →
                </Link>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-400 col-span-2">No results found.</p>
          )}
        </div>

        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Still need help?{" "}
            <Link
              href="/contact"
              className="text-blue-700 font-bold hover:underline"
            >
              Contact us
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
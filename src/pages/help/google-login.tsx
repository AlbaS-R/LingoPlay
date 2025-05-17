import Link from "next/link";
import React from "react";

export default function GoogleLoginHelp() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-white to-gray-100 pl-64 py-16 px-8 text-gray-800">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl p-10 border border-gray-200">
        <Link
          href="/help"
          className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 mb-6"
        >
          <span className="text-lg">←</span> Back to Help Center
        </Link>

        <h1 className="text-4xl font-bold text-[#235390] mb-6">Google Login Help</h1>
        <p className="mb-6 text-base text-gray-700">
          Having trouble logging in with Google? Here’s how to fix it.
        </p>
        <ul className="list-disc pl-6 space-y-4 text-base text-gray-700">
          <li><strong>Enable Provider:</strong> Make sure Google Sign-In is enabled in Firebase.</li>
          <li><strong>Authorized Domains:</strong> Add <code>localhost</code> or your domain to the Firebase auth settings.</li>
          <li><strong>Popups:</strong> Allow popups in your browser settings if blocked.</li>
        </ul>

        <div className="mt-10 border-t pt-6 text-sm text-gray-500">
          Still having trouble?{" "}
          <Link href="/contact" className="text-blue-600 font-medium hover:underline">
            Reach out to us
          </Link>
        </div>
      </div>
    </main>
  );
}
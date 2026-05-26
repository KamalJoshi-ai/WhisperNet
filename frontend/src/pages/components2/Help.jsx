import React from "react";

export default function Help() {
  return (
    <div className="p-6 max-w-2xl h-screen mx-auto bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-blue-600 mb-4">Whishper Net - Help</h1>
      
      <p className="text-gray-700 mb-6">
        Welcome to <span className="font-semibold">Whishper Net</span>, your secure and fast chat app.
        Here’s a quick guide to get you started:
      </p>

      <ul className="list-disc list-inside space-y-2 text-gray-800">
        <li><strong>Start a Chat:</strong> Click on the <em>New Chat</em> button to begin messaging.</li>
        <li><strong>Send Messages:</strong> Type your message in the input box and press <kbd>Enter</kbd>.</li>
        <li><strong>Emojis & Attachments:</strong> Use the emoji icon or attach files directly.</li>
        <li><strong>Status Updates:</strong> Online/offline status is shown next to each user.</li>
        <li><strong>Logout:</strong> Use the profile menu to securely log out.</li>
      </ul>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
        <h2 className="text-lg font-semibold text-blue-700 mb-2">Tips</h2>
        <p className="text-gray-700">
          - Keep your app updated for the latest features.<br />
          - Use a strong password for your account.<br />
          - If you face issues, clear cache or reconnect your socket.
        </p>
      </div>

      <p className="mt-6 text-sm text-gray-500">
        Need more help? Contact support at <a href="mailto:support@whishper.net" className="text-blue-600">support@whishper.net</a>.
      </p>
    </div>
  );
}

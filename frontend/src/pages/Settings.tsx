import React, { useState } from 'react';

export default function Settings() {
  const [settings, setSettings] = useState({
    companyName: 'My Company',
    email: 'admin@example.com',
    timezone: 'UTC',
    language: 'English',
  });

  const handleChange = (field: string, value: string) => {
    setSettings({ ...settings, [field]: value });
  };

  const handleSave = () => {
    // TODO: Save settings to backend
    alert('Settings saved!');
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Settings</h1>

      <div className="bg-slate-900 p-6 rounded-lg border border-slate-800 space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Company Name</label>
          <input
            type="text"
            value={settings.companyName}
            onChange={(e) => handleChange('companyName', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <input
            type="email"
            value={settings.email}
            onChange={(e) => handleChange('email', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-teal-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Timezone</label>
          <select
            value={settings.timezone}
            onChange={(e) => handleChange('timezone', e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded px-4 py-2 text-white focus:outline-none focus:border-teal-500"
          >
            <option>UTC</option>
            <option>EST</option>
            <option>CST</option>
            <option>MST</option>
            <option>PST</option>
          </select>
        </div>

        <button
          onClick={handleSave}
          className="bg-teal-600 hover:bg-teal-700 px-6 py-2 rounded text-white font-medium transition mt-6"
        >
          Save Settings
        </button>
      </div>
    </div>
  );
}

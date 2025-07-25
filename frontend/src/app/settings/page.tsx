import CurrencySelector from '@/components/CurrencySelector';

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Settings</h1>
      <div className="max-w-md">
        <CurrencySelector />
      </div>
    </div>
  );
}
import { Vault } from "lucide-react";

const Header = () => {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500/20 to-blue-500/20 border border-emerald-500/30">
          <Vault className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-white">
          Manage <span className="gradient-text">Vaults</span>
        </h1>
      </div>
      <p className="text-lg text-white/70">
        Deposit collateral, mint AGS, and manage your vault positions
      </p>
    </div>
  );
};

export default Header;

import { Button } from "@/components/ui/button";
import { LogOut, BrainCircuit } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Header = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b bg-background/80 backdrop-blur-sm px-6">
      <div className="flex items-center gap-3">
        <div className="inline-block p-2 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg shadow-sm">
          <BrainCircuit className="w-6 h-6 text-white" />
        </div>
        <h1 className="text-xl font-semibold text-gray-800">Analizador Inteligente de CVs</h1>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="h-4 w-4 mr-2" />
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
};

export default Header;

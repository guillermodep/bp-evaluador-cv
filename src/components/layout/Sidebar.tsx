import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SlidersHorizontal, Trash2, Plus, X } from 'lucide-react';
import RoleSeniorityChart from '@/components/RoleSeniorityChart';

interface SidebarProps {
  requiredSkills: string[];
  setRequiredSkills: (skills: string[]) => void;
  roleSeniorityChartData: any[];
  handleChartFilterChange: (role: string | null, seniority: string | null) => void;
  selectedChartRole: string | null;
  selectedChartSeniority: string | null;
  hasCandidates: boolean;
}

const Sidebar = ({
  requiredSkills,
  setRequiredSkills,
  roleSeniorityChartData,
  handleChartFilterChange,
  selectedChartRole,
  selectedChartSeniority,
  hasCandidates,
}: SidebarProps) => {
  const [skillInput, setSkillInput] = useState('');

  const addSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  return (
    <aside className="hidden lg:flex flex-col gap-8 w-96 h-full p-4 bg-gray-50/50 border-r">
      <Card className="bg-white/80 backdrop-blur-sm border-white/20 shadow-lg overflow-hidden flex-1">
        <CardHeader className="p-4 border-b">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center">
                <SlidersHorizontal size={18} className="mr-2 text-indigo-600" />
                Filtros de Búsqueda
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 mt-1">
                Refina tu búsqueda de talento.
              </CardDescription>
            </div>
            {requiredSkills.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => setRequiredSkills([])} className="text-xs">
                <Trash2 size={14} className="mr-1.5" />
                Limpiar
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Input
              type="text"
              value={skillInput}
              placeholder="Añade un criterio (ej: React)"
              className="flex-grow text-sm"
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSkill();
                }
              }}
            />
            <Button
              onClick={addSkill}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-sm"
              disabled={!skillInput.trim()}
            >
              <Plus size={16} className="mr-1" />
              Añadir
            </Button>
          </div>

          <div className="min-h-[40px] p-2 bg-gray-100/50 rounded-lg border border-dashed flex flex-wrap gap-2 items-center">
            {requiredSkills.length > 0 ? (
              requiredSkills.map(skill => (
                <Badge key={skill} variant="secondary" className="text-xs pl-2 pr-1 py-1 bg-indigo-100 text-indigo-800 hover:bg-indigo-200 border border-indigo-200 shadow-sm flex items-center gap-1">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="hover:text-red-500 transition-colors rounded-full p-0.5">
                    <X size={12} />
                  </button>
                </Badge>
              ))
            ) : (
              <p className="text-xs text-gray-500 w-full text-center">Los criterios que añadas aparecerán aquí.</p>
            )}
          </div>

          {hasCandidates && (
            <div className="mt-4 pt-4 border-t">
              <h3 className="text-sm font-semibold text-gray-700 mb-2 text-center">Distribución de Roles</h3>
              <div className="h-[300px]">
                <RoleSeniorityChart
                  data={roleSeniorityChartData}
                  onFilterChange={handleChartFilterChange}
                  selectedRole={selectedChartRole}
                  selectedSeniority={selectedChartSeniority}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
};

export default Sidebar;

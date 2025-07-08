import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { popularITRoles } from '@/utils/evaluationUtils';

interface RoleSuggestionProps {
  activePopularRoles?: string[]; // Hacerla opcional por si se usa en otros contextos sin esta info
}

const RoleSuggestion = ({ activePopularRoles = [] }: RoleSuggestionProps) => {
  return (
    <Card className="w-full bg-white/80 backdrop-blur-sm border-indigo-50">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-indigo-100">
        <CardTitle className="text-gray-800">Roles de TI Más Demandados</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-2">
          {popularITRoles.map((role, index) => {
            const isActive = activePopularRoles.map(r => r.toLowerCase()).includes(role.toLowerCase());
            return (
              <Badge 
                key={index} 
                variant={isActive ? "default" : "outline"} 
                className={`cursor-pointer transition-all ${isActive 
                  ? 'bg-green-500 hover:bg-green-600 text-white border-green-600 shadow-md scale-105'
                  : 'bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-600 border-indigo-200'}`}
              >
                {role}
              </Badge>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default RoleSuggestion;

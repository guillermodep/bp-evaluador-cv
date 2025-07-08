
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Code, Database, Layout } from "lucide-react";

// Esta es una lista de evaluaciones recientes simulada
const recentEvaluations = [
  {
    id: 1,
    role: "Frontend Developer",
    date: "10 Mayo, 2025",
    candidates: 5,
    topSkills: ["React", "TypeScript", "Tailwind CSS"],
    icon: Code,
  },
  {
    id: 2,
    role: "Backend Developer",
    date: "8 Mayo, 2025",
    candidates: 3,
    topSkills: ["Node.js", "Express", "MongoDB"],
    icon: Database,
  },
  {
    id: 3,
    role: "UX/UI Designer",
    date: "5 Mayo, 2025",
    candidates: 4,
    topSkills: ["Figma", "Adobe XD", "Sketch"],
    icon: Layout,
  },
  {
    id: 4,
    role: "Project Manager",
    date: "1 Mayo, 2025",
    candidates: 2,
    topSkills: ["Agile", "Scrum", "Jira"],
    icon: Calendar,
  },
];

const RecentEvaluations = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {recentEvaluations.map((evaluation) => (
        <Card key={evaluation.id} className="overflow-hidden transition-all hover:shadow-md hover:-translate-y-1 bg-gradient-to-br from-white to-slate-50 border border-indigo-50">
          <CardContent className="p-5">
            <div className="flex items-center mb-3">
              <div className="p-2 rounded-lg bg-indigo-100 mr-3">
                <evaluation.icon className="h-5 w-5 text-indigo-600" />
              </div>
              <h3 className="font-medium text-gray-800">{evaluation.role}</h3>
            </div>
            <div className="text-sm text-gray-500 mb-3 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1.5" />
              {evaluation.date}
            </div>
            <div className="text-xs text-gray-500 mb-3">
              {evaluation.candidates} candidatos evaluados
            </div>
            <div className="flex flex-wrap gap-1.5">
              {evaluation.topSkills.map((skill, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="text-xs bg-white text-indigo-600 border-indigo-200"
                >
                  {skill}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default RecentEvaluations;

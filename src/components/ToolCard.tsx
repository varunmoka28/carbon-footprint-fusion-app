
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  isComingSoon?: boolean;
}

const ToolCard = ({ title, description, icon: Icon, onClick, isComingSoon = false }: ToolCardProps) => {
  return (
    <Card
      onClick={!isComingSoon ? onClick : undefined}
      className={cn(
        "cursor-pointer transition-all hover:shadow-xl hover:-translate-y-2 text-left group relative overflow-hidden",
        "bg-card", // Explicitly set background for clarity
        isComingSoon && "bg-muted/50 cursor-not-allowed opacity-75"
      )}
    >
      <Icon className="absolute -right-4 -bottom-4 h-32 w-32 text-gray-200 opacity-50 group-hover:scale-110 group-hover:opacity-60 transition-transform duration-300" />

      <div className="relative z-10">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-medium pr-4">{title}</CardTitle>
          <div className="bg-eco-green/10 p-2 rounded-lg">
            <Icon className="h-6 w-6 text-eco-green" />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{description}</p>
          {isComingSoon && (
            <Badge variant="secondary" className="mt-4 font-semibold">Coming Soon</Badge>
          )}
        </CardContent>
      </div>
    </Card>
  );
};

export default ToolCard;

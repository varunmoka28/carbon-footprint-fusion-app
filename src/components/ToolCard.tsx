
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
        "cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1 text-left",
        isComingSoon && "bg-muted/50 cursor-not-allowed opacity-75"
      )}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{title}</CardTitle>
        <Icon className="h-6 w-6 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
        {isComingSoon && (
          <Badge variant="secondary" className="mt-4 font-semibold">Coming Soon</Badge>
        )}
      </CardContent>
    </Card>
  );
};

export default ToolCard;

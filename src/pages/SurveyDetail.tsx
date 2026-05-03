import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSurveyStore, Survey } from '@/stores/surveyStore';
import { 
  ChevronLeft, ClipboardCheck, Users, BarChart3, 
  Calendar, Clock, Edit2, Share2, MoreVertical 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuLabel, DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';

export default function SurveyDetailPage() {
  const { surveyId } = useParams();
  const { surveys, fetchSurveys } = useSurveyStore();
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      if (surveys.length === 0) await fetchSurveys();
      const found = surveys.find(s => s.id === surveyId);
      setSurvey(found || null);
      setIsLoading(false);
    };
    load();
  }, [surveyId, surveys, fetchSurveys]);

  if (isLoading) {
    return (
      <div className="space-y-6 animate-in fade-in">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-64 col-span-2" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!survey) {
    return (
      <div className="flex flex-col items-center justify-center p-20">
        <h2 className="text-xl font-bold mb-4">Survey Not Found</h2>
        <Button asChild>
          <Link to="/surveys">Back to Surveys</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/surveys">
              <ChevronLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold tracking-tight">{survey.title}</h2>
              <Badge variant={survey.status === 'active' ? 'default' : 'secondary'}>
                {survey.status}
              </Badge>
            </div>
            <p className="text-muted-foreground">{survey.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to={`/surveys/edit/${survey.id}`}>
              <Edit2 className="w-4 h-4 mr-2" /> Edit Survey
            </Link>
          </Button>
          <Button size="sm">
            <Share2 className="w-4 h-4 mr-2" /> Publish
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Options</DropdownMenuLabel>
              <DropdownMenuItem>Duplicate Survey</DropdownMenuItem>
              <DropdownMenuItem>Export Results (CSV)</DropdownMenuItem>
              <DropdownMenuItem className="text-red-600">Delete Permanently</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-primary/10 text-primary rounded-full">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Responses</p>
              <h3 className="text-2xl font-bold">{survey.submissionsCount}</h3>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-amber-100 text-amber-700 rounded-full">
              <ClipboardCheck className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completion Rate</p>
              <h3 className="text-2xl font-bold">84%</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-green-100 text-green-700 rounded-full">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Reward</p>
              <h3 className="text-2xl font-bold">{survey.reward}</h3>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center space-x-4">
            <div className="p-3 bg-blue-100 text-blue-700 rounded-full">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Avg. Time</p>
              <h3 className="text-2xl font-bold">5m 12s</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Detail Panel */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Survey Structure</CardTitle>
            <CardDescription>Questions and logic flow for this survey.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               {survey.questions.map((q, idx) => (
                 <div key={q.id} className="p-4 border rounded-lg bg-muted/30">
                   <div className="flex items-start justify-between">
                     <div>
                       <span className="text-xs font-bold text-primary uppercase tracking-wider">Question {idx + 1} • {q.type}</span>
                       <p className="font-medium mt-1">{q.text}</p>
                       {q.options && q.options.length > 0 && (
                         <div className="mt-2 flex flex-wrap gap-2">
                           {q.options.map((opt, i) => (
                             <Badge key={i} variant="outline" className="bg-background">{opt}</Badge>
                           ))}
                         </div>
                       )}
                     </div>
                   </div>
                 </div>
               ))}
             </div>
          </CardContent>
        </Card>

        {/* Info Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center"><Calendar className="w-4 h-4 mr-2" /> Created At</span>
                <span className="font-medium">{format(new Date(survey.createdAt), 'MMM d, yyyy')}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center"><Calendar className="w-4 h-4 mr-2" /> Category</span>
                <Badge variant="outline">{survey.category}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center"><Users className="w-4 h-4 mr-2" /> Targeted Audience</span>
                <span className="font-medium">All Users</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <div className="w-2 h-2 rounded-full bg-green-500" />
                    <div className="flex-1">
                      <p className="font-medium">New submission received</p>
                      <p className="text-xs text-muted-foreground">20 minutes ago</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="w-full mt-4" asChild>
                <Link to="/surveys/submissions">View All Submissions</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

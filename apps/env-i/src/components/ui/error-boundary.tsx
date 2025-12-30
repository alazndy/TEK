
"use client"

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center p-4 text-center bg-background">
          <div className="rounded-full bg-red-100 p-3 dark:bg-red-900/20 mb-4">
            <AlertTriangle className="h-10 w-10 text-red-600 dark:text-red-500" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Bir şeyler ters gitti</h1>
          <p className="text-muted-foreground max-w-[500px] mb-6">
            Beklenmedik bir hata oluştu. Lütfen sayfayı yenilemeyi deneyin.
            Hata devam ederse sistem yöneticisi ile iletişime geçin.
          </p>
          <div className="flex gap-4">
             <Button 
                variant="outline"
                onClick={() => window.location.reload()}
             >
                Sayfayı Yenile
             </Button>
             <Button 
                variant="default"
                onClick={() => this.setState({ hasError: false, error: null })}
             >
                Tekrar Dene
             </Button>
          </div>
          {process.env.NODE_ENV === 'development' && this.state.error && (
            <div className="mt-8 p-4 bg-slate-100 dark:bg-slate-900 rounded-md text-left w-full max-w-2xl overflow-auto max-h-64">
                <code className="text-xs font-mono text-red-500">
                    {this.state.error.toString()}
                </code>
            </div>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}

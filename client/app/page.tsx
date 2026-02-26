import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, Clock, Shield, BarChart3, Layout, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-md bg-primary" />
            <span className="text-xl font-bold">Vidyanvesha</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="ghost" asChild>
              <Link href="/login">Login</Link>
            </Button>
            <Button asChild>
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container px-4 py-20">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm">
              <Zap className="h-4 w-4 text-primary" />
              <span>Professional Form & Quiz Management</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-bold tracking-tight sm:text-6xl">
              Create, Manage & Analyze
              <span className="text-primary"> Forms & Quizzes</span>
            </h1>
            
            <p className="mb-10 text-xl text-muted-foreground">
              Build professional forms and quizzes for colleges, organizations, and assessments.
              Complete control with advanced features and detailed analytics.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="text-lg h-12" asChild>
                <Link href="/register">
                  Start Creating Forms
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg h-12" asChild>
                <Link href="/take/demo-quiz-public">
                  Try Demo Quiz
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t bg-background py-20">
        <div className="container px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold">Everything You Need</h2>
            <p className="text-lg text-muted-foreground">
              Powerful features to create and manage forms efficiently
            </p>
          </div>

          <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader>
                <Layout className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Flexible Form Builder</CardTitle>
                <CardDescription>
                  Create forms with multiple sections, various question types, and custom settings
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Clock className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Time Management</CardTitle>
                <CardDescription>
                  Set time limits, schedule forms, and control attempt windows with precision
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Shield className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Access Control</CardTitle>
                <CardDescription>
                  Manage who can access forms with email restrictions and authentication
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CheckCircle2 className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Auto Grading</CardTitle>
                <CardDescription>
                  Automatic scoring for MCQs with customizable marking schemes and negative marking
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <BarChart3 className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Analytics</CardTitle>
                <CardDescription>
                  Track responses, analyze performance, and export detailed reports
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <Zap className="mb-2 h-10 w-10 text-primary" />
                <CardTitle>Real-time Updates</CardTitle>
                <CardDescription>
                  See responses as they come in with instant notifications and updates
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30 py-20">
        <div className="container px-4">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-3xl font-bold">Ready to Get Started?</h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Create your first form in minutes. No credit card required.
            </p>
            <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" asChild>
                <Link href="/register">
                  Create Free Account
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">
                  Login to Dashboard
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container px-4">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="h-6 w-6 rounded bg-primary" />
              <span className="font-semibold">Vidyanvesha Form Manager</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Vidyanvesha. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}


    
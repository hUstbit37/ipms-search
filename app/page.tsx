import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-4">
            Tra cứu Sở hữu Trí tuệ
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Hệ thống tra cứu dữ liệu sở hữu trí tuệ với Next.js 16, TypeScript, TanStack Query và shadcn/ui
          </p>
        </div>

        <div className="max-w-4xl mx-auto grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="p-6">
            <h3 className="font-semibold mb-2">⚡ Next.js 16</h3>
            <p className="text-sm text-muted-foreground">
              App Router với React Server Components
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">🎨 shadcn/ui</h3>
            <p className="text-sm text-muted-foreground">
              Components đẹp, accessible và customizable
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">📊 TanStack Query</h3>
            <p className="text-sm text-muted-foreground">
              Server state management mạnh mẽ
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">💅 Tailwind CSS</h3>
            <p className="text-sm text-muted-foreground">
              Utility-first CSS framework
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">🔷 TypeScript</h3>
            <p className="text-sm text-muted-foreground">
              Type-safe development
            </p>
          </Card>
          
          <Card className="p-6">
            <h3 className="font-semibold mb-2">🚀 Ready to Build</h3>
            <p className="text-sm text-muted-foreground">
              Production-ready setup
            </p>
          </Card>
        </div>

        <div className="text-center mt-12">
          <a href="/trademarks">
            <Button size="lg" className="mr-4">
              Tra cứu Nhãn hiệu
            </Button>
          </a>
          <Button size="lg" variant="outline">
            Tìm hiểu thêm
          </Button>
        </div>
      </main>
    </div>
  );
}

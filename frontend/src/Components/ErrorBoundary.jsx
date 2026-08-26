import React from "react";
import { Button, Card, Typography } from "@material-tailwind/react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
          <Card className="p-8 max-w-md w-full text-center shadow-lg border border-gray-200">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
              !
            </div>
            <Typography variant="h4" color="blue-gray" className="mb-2">
              কিছু একটা ভুল হয়েছে
            </Typography>
            <Typography color="gray" className="text-sm mb-6">
              অ্যাপ্লিকেশনে একটি অপ্রত্যাশিত সমস্যা হয়েছে। অনুগ্রহ করে পেজটি রিফ্রেশ করুন।
            </Typography>
            <Button
              onClick={this.handleReload}
              className="bg-[#050C9C] hover:bg-[#040974] normal-case"
            >
              পেজ রিফ্রেশ করুন
            </Button>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

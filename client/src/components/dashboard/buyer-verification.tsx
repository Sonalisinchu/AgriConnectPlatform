import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, Clock, Upload } from "lucide-react";

interface BuyerVerificationProps {
  className?: string;
}

export function BuyerVerification({ className }: BuyerVerificationProps) {
  const { user, verifyBuyerMutation } = useAuth();
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };
  
  const handleVerification = () => {
    if (!selectedFile) {
      toast({
        title: "No file selected",
        description: "Please upload a valid ID proof document.",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, we would upload the file to the server
    // For this demo, we'll just call the verify endpoint
    verifyBuyerMutation.mutate();
  };
  
  return (
    <section id="verification" className={className}>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-semibold text-xl">Verification Status</h3>
            
            {user?.isVerified ? (
              <div className="flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                <CheckCircle className="mr-2 h-4 w-4" />
                <span>Verified Buyer</span>
              </div>
            ) : (
              <div className="flex items-center bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                <Clock className="mr-2 h-4 w-4" />
                <span>Pending Verification</span>
              </div>
            )}
          </div>
          
          {user?.isVerified ? (
            <div>
              <p className="text-green-700 mb-4">
                Your account is verified! You can now place orders and connect with farmers.
              </p>
              <ul className="text-sm text-neutral-600 space-y-2">
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-2 h-4 w-4" />
                  Access to contact all farmers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-2 h-4 w-4" />
                  Place orders for any quantity
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-2 h-4 w-4" />
                  Receive special offers from farmers
                </li>
                <li className="flex items-center">
                  <CheckCircle className="text-primary mr-2 h-4 w-4" />
                  Priority customer support
                </li>
              </ul>
            </div>
          ) : (
            <>
              <div className="border-b border-neutral-200 pb-6 mb-6">
                <p className="text-neutral-600 mb-4">
                  To access all features and connect with farmers, please complete your verification process by uploading a valid ID proof.
                </p>
                
                <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
                  <div className="flex-1 w-full">
                    <div 
                      className="border-2 border-dashed border-neutral-300 rounded-lg p-6 text-center"
                      onClick={() => document.getElementById("file-upload")?.click()}
                    >
                      <Upload className="mx-auto text-neutral-400 h-8 w-8 mb-2" />
                      <p className="text-neutral-600 mb-2">
                        {selectedFile ? selectedFile.name : "Drag & drop your ID proof here"}
                      </p>
                      <p className="text-neutral-500 text-sm">Supported formats: JPG, PNG, PDF (Max size: 5MB)</p>
                      <input 
                        id="file-upload" 
                        type="file" 
                        className="hidden" 
                        accept=".jpg,.jpeg,.png,.pdf" 
                        onChange={handleFileChange}
                      />
                      <Button 
                        variant="secondary" 
                        className="mt-4"
                        onClick={(e) => {
                          e.stopPropagation();
                          document.getElementById("file-upload")?.click();
                        }}
                      >
                        Browse Files
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full">
                    <h4 className="font-medium mb-2">Accepted ID Proofs:</h4>
                    <ul className="text-sm text-neutral-600 space-y-2">
                      <li className="flex items-center">
                        <CheckCircle className="text-primary mr-2 h-4 w-4" />
                        Aadhaar Card
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="text-primary mr-2 h-4 w-4" />
                        PAN Card
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="text-primary mr-2 h-4 w-4" />
                        Voter ID
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="text-primary mr-2 h-4 w-4" />
                        Driving License
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Verification Timeline</h4>
                  <p className="text-sm text-neutral-500">Usually takes 24-48 hours after document submission</p>
                </div>
                
                <Button 
                  onClick={handleVerification}
                  disabled={!selectedFile || verifyBuyerMutation.isPending}
                >
                  {verifyBuyerMutation.isPending ? "Processing..." : "Complete Verification"}
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export default BuyerVerification;


import React, { useState, useRef, useEffect } from 'react';
import { IssueType } from '@/types';
import { useIssues } from '@/context/IssueContext';
import { useAuth } from '@/context/AuthContext';
import { Camera, MapPin, Loader2, LogIn, Image as ImageIcon, X } from 'lucide-react';
import { toast } from '@/components/ui/sonner';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import Map from './Map';

const ReportForm: React.FC = () => {
  const { addIssue } = useIssues();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [type, setType] = useState<IssueType>('pothole');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const issueTypes: { value: IssueType; label: string; emoji: string }[] = [
    { value: 'pothole', label: 'Pothole', emoji: '🕳️' },
    { value: 'streetlight', label: 'Street Light', emoji: '💡' },
    { value: 'graffiti', label: 'Graffiti', emoji: '🖌️' },
    { value: 'trash', label: 'Trash/Debris', emoji: '🗑️' },
    { value: 'sidewalk', label: 'Sidewalk Issue', emoji: '🚶' },
    { value: 'water', label: 'Water Issue', emoji: '💧' },
    { value: 'traffic-signal', label: 'Traffic Signal', emoji: '🚦' },
    { value: 'other', label: 'Other', emoji: '⚠️' },
  ];

  // Initialize camera when showCamera changes
  useEffect(() => {
    if (showCamera) {
      initCamera();
    } else {
      // Stop camera stream when component unmounts or camera is hidden
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    }
  }, [showCamera]);

  // Initialize camera
  const initCamera = async () => {
    try {
      setCameraError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setCameraError('Unable to access camera. Please check permissions.');
    }
  };

  // Take a photo from camera
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw video frame to canvas
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        // Convert canvas to image URL
        try {
          // Compress image before saving
          const imageUrl = canvas.toDataURL('image/jpeg', 0.7);
          setImage(imageUrl);
          setShowCamera(false);
        } catch (error) {
          console.error('Error capturing photo:', error);
          toast.error('Failed to capture photo. Please try again.');
        }
      }
    }
  };

  // Handle file upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (limit to 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image is too large. Please select an image under 5MB.');
      return;
    }

    // Create a FileReader to read and compress the image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        // Create an image element to get dimensions
        const img = new Image();
        img.onload = () => {
          // Create canvas for resizing/compressing
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Resize if image is too large
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;

          if (width > height && width > MAX_WIDTH) {
            height = Math.round(height * (MAX_WIDTH / width));
            width = MAX_WIDTH;
          } else if (height > MAX_HEIGHT) {
            width = Math.round(width * (MAX_HEIGHT / height));
            height = MAX_HEIGHT;
          }

          canvas.width = width;
          canvas.height = height;

          // Draw and compress
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            setImage(dataUrl);
          }
        };
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLocationSelect = (lat: number, lng: number, address: string) => {
    setLocation({ lat, lng, address });
    setShowMap(false);
  };

  const detectCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          // In a real app, we would reverse geocode to get the address
          setLocation({
            lat: latitude,
            lng: longitude,
            address: `Location at ${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
          alert('Unable to get your location. Please select manually.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!location) {
      toast.error('Please select a location for your report');
      return;
    }

    if (!description) {
      toast.error('Please provide a description of the issue');
      return;
    }

    setSubmitting(true);

    try {
      // Add the issue to our context (which now calls the API)
      await addIssue({
        type,
        description,
        location,
        imageUrl: image || undefined,
        reportedBy: user.email || 'Anonymous',
      });

      // Reset form and show success message
      setType('pothole');
      setDescription('');
      setLocation(null);
      setImage(null);
      setSubmitSuccess(true);

      // Hide success message after a few seconds
      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Indian district labels for the form
  const indianDistricts = [
    'Delhi', 'Mumbai', 'Kolkata', 'Chennai', 'Bengaluru',
    'Hyderabad', 'Ahmedabad', 'Pune', 'Jaipur', 'Lucknow',
    'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
    'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana'
  ];

  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="bg-civic-purple p-6 text-white">
          <h2 className="text-2xl font-bold">Report an Issue</h2>
          <p className="mt-2 opacity-90">Help improve your community by reporting public infrastructure issues</p>
        </div>
        <div className="p-6 flex flex-col items-center justify-center text-center">
          <LogIn className="h-12 w-12 text-civic-purple mb-4" />
          <h3 className="text-xl font-semibold mb-2">Login Required</h3>
          <p className="text-gray-600 mb-6">
            Please log in or create an account to report issues in your community.
          </p>
          <Button
            onClick={() => navigate('/auth')}
            className="bg-civic-purple hover:bg-civic-darkPurple"
          >
            Login or Sign Up
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="bg-civic-purple p-6 text-white">
        <h2 className="text-2xl font-bold">Report an Issue</h2>
        <p className="mt-2 opacity-90">Help improve your community by reporting public infrastructure issues</p>
      </div>

      {submitSuccess ? (
        <div className="p-6 bg-green-50 border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-lg font-medium text-green-800">Report Submitted!</h3>
              <p className="text-green-700 mt-1">Thank you for your report. Municipal officials have been notified.</p>
              <button
                className="mt-3 text-sm text-green-600 hover:text-green-500 font-medium"
                onClick={() => setSubmitSuccess(false)}
              >
                Submit another report
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Issue Type
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {issueTypes.map((issueType) => (
                <button
                  key={issueType.value}
                  type="button"
                  className={`flex flex-col items-center justify-center p-3 rounded-lg border ${
                    type === issueType.value
                      ? 'border-civic-purple bg-purple-50 text-civic-purple'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                  onClick={() => setType(issueType.value)}
                >
                  <span className="text-xl mb-1">{issueType.emoji}</span>
                  <span className="text-sm">{issueType.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block text-gray-700 text-sm font-bold mb-2">
              Description
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 text-gray-700 border rounded-lg focus:outline-none focus:ring-2 focus:ring-civic-purple min-h-[120px]"
              placeholder="Please describe the issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Location
            </label>
            {location ? (
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <MapPin className="text-civic-purple mr-2" size={18} />
                  <span className="text-gray-600">{location.address}</span>
                </div>
                <button
                  type="button"
                  className="text-sm text-civic-purple hover:text-civic-darkPurple"
                  onClick={() => setShowMap(true)}
                >
                  Change
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 flex-1"
                  onClick={detectCurrentLocation}
                >
                  <MapPin className="mr-2" size={18} />
                  Use my location
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center px-4 py-2 bg-civic-blue text-white rounded-lg hover:bg-blue-600 flex-1"
                  onClick={() => setShowMap(true)}
                >
                  Select on map
                </button>
              </div>
            )}

            {showMap && (
              <div className="mt-4 h-[300px] rounded-lg overflow-hidden border border-gray-200">
                <Map
                  selectLocation
                  onLocationSelect={handleLocationSelect}
                  zoom={13}
                />
              </div>
            )}
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Add Photo (Optional)
            </label>
            {showCamera ? (
              <div className="relative rounded-lg overflow-hidden border border-gray-300">
                {cameraError ? (
                  <div className="p-4 bg-red-50 text-red-700 text-center">
                    <p>{cameraError}</p>
                    <button
                      type="button"
                      className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                      onClick={() => setShowCamera(false)}
                    >
                      Close Camera
                    </button>
                  </div>
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-64 object-cover"
                    />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-black bg-opacity-50 flex justify-between">
                      <button
                        type="button"
                        className="px-3 py-1 bg-white text-gray-700 rounded-lg hover:bg-gray-100"
                        onClick={() => setShowCamera(false)}
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        className="px-3 py-1 bg-civic-purple text-white rounded-lg hover:bg-civic-darkPurple"
                        onClick={capturePhoto}
                      >
                        Take Photo
                      </button>
                    </div>
                  </>
                )}
              </div>
            ) : image ? (
              <div className="relative h-48 bg-gray-100 rounded-lg overflow-hidden">
                <img src={image} alt="Issue preview" className="w-full h-full object-cover" />
                <div className="absolute top-2 right-2 flex gap-2">
                  <button
                    type="button"
                    className="bg-white p-2 rounded-full shadow-md hover:bg-gray-100"
                    onClick={() => setImage(null)}
                  >
                    <X className="h-4 w-4 text-gray-600" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <input
                    type="file"
                    id="photo-upload"
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageChange}
                  />
                  <label
                    htmlFor="photo-upload"
                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 h-full"
                  >
                    <div className="text-center">
                      <ImageIcon className="mx-auto h-8 w-8 text-gray-400" />
                      <span className="mt-2 block text-sm font-medium text-gray-700">
                        Upload Photo
                      </span>
                      <span className="mt-1 block text-xs text-gray-500">
                        JPG, PNG up to 5MB
                      </span>
                    </div>
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCamera(true)}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50"
                >
                  <div className="text-center">
                    <Camera className="mx-auto h-8 w-8 text-gray-400" />
                    <span className="mt-2 block text-sm font-medium text-gray-700">
                      Take Photo
                    </span>
                    <span className="mt-1 block text-xs text-gray-500">
                      Use device camera
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || !location || !description}
              className={`px-6 py-3 bg-civic-purple text-white rounded-lg flex items-center ${
                submitting || !location || !description
                  ? 'opacity-70 cursor-not-allowed'
                  : 'hover:bg-civic-darkPurple'
              }`}
            >
              {submitting ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={18} />
                  Submitting...
                </>
              ) : (
                'Submit Report'
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default ReportForm;

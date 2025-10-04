import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Code, ChevronRight, Sparkles } from 'lucide-react';

const POPULAR_TECH_STACK = [
  'JavaScript', 'TypeScript', 'React', 'Vue', 'Angular', 'Svelte',
  'Node.js', 'Python', 'Django', 'Flask', 'FastAPI',
  'Java', 'Spring', 'Kotlin', 'Go', 'Rust',
  'PHP', 'Laravel', 'Ruby', 'Rails',
  'C++', 'C#', '.NET', 'Swift', 'Dart', 'Flutter',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP',
  'PostgreSQL', 'MongoDB', 'Redis', 'MySQL',
  'Machine Learning', 'TensorFlow', 'PyTorch', 'AI',
  'GraphQL', 'REST API', 'Microservices',
  'Git', 'CI/CD', 'DevOps'
];

const OnboardingPage = () => {
  const { updateProfile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userData = location.state; // Get user data passed from signup

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    bio: '',
    techStack: []
  });
  const [loading, setLoading] = useState(false);

  const handleTechToggle = (tech) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const handleNext = () => {
    if (step === 1 && formData.techStack.length === 0) {
      alert('Please select at least one technology');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Prepare complete user data
    const completeUserData = {
      email: userData?.email || '',
      displayName: userData?.displayName || '',
      bio: formData.bio,
      techStack: formData.techStack,
      onboardingComplete: true,
      createdAt: new Date().toISOString(),
      isAuthenticated: true
    };

    // Update profile (saves to localStorage immediately, syncs to Firebase in background)
    await updateProfile(completeUserData);

    // Set authenticated status
    localStorage.setItem('isAuthenticated', 'true');
    console.log('✅ User authenticated and onboarding complete');

    // Navigate immediately - Firebase syncs in background
    navigate('/');
  };

  const handleSkip = async () => {
    // Save basic user data even when skipping
    const basicUserData = {
      email: userData?.email || '',
      displayName: userData?.displayName || '',
      onboardingComplete: false,
      createdAt: new Date().toISOString(),
      isAuthenticated: true
    };

    // Update profile (saves to localStorage immediately, syncs to Firebase in background)
    await updateProfile(basicUserData);
    
    // Set authenticated status
    localStorage.setItem('isAuthenticated', 'true');
    console.log('✅ User authenticated (skipped onboarding)');
    
    // Navigate away - they can complete onboarding later
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 to-primary-800 dark:from-primary-700 dark:to-primary-900 flex items-center justify-center px-4 py-12">
      <div className="max-w-4xl w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles size={48} className="text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Let's Personalize Your Experience
          </h1>
          <p className="text-primary-100 text-lg">
            Help us recommend the best open source projects for you
          </p>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className={`h-2 w-32 rounded-full ${step >= 1 ? 'bg-white' : 'bg-white/30'}`}></div>
          <div className={`h-2 w-32 rounded-full ${step >= 2 ? 'bg-white' : 'bg-white/30'}`}></div>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {step === 1 ? (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <Code className="text-primary-600 dark:text-primary-400" size={32} />
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Select Your Tech Stack
                </h2>
              </div>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Choose the technologies you're interested in or have experience with. 
                We'll use this to recommend relevant projects.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-8 max-h-96 overflow-y-auto p-2">
                {POPULAR_TECH_STACK.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => handleTechToggle(tech)}
                    className={`px-4 py-3 rounded-lg font-medium transition-all text-sm ${
                      formData.techStack.includes(tech)
                        ? 'bg-primary-600 text-white shadow-md scale-105'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between">
                <button
                  onClick={handleSkip}
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                >
                  Skip for now
                </button>
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 btn-primary"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Tell Us About Yourself
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Bio (Optional)
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={5}
                  className="input-field resize-none"
                  placeholder="Tell the community about yourself, your experience, and what you're looking to contribute to..."
                />
              </div>

              {/* Selected Tech Stack Summary */}
              <div className="mb-8">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Selected Technologies ({formData.techStack.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.techStack.map((tech) => (
                    <span
                      key={tech}
                      className="bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="btn-secondary"
                >
                  Back
                </button>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={handleSkip}
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-primary disabled:opacity-50"
                  >
                    {loading ? 'Completing...' : 'Complete Setup'}
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
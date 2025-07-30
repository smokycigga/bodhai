'use client';

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";
import Navbar from "./navbar";


export default function Homepage() {
  const router = useRouter();
  const heroRef = useRef(null);
  const statsRef = useRef(null);
  const dashboardRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isAnnual, setIsAnnual] = useState(true);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 23,
    minutes: 59,
    seconds: 0
  });

  useEffect(() => {
    setIsLoaded(true);

    // Set target date (30 days from now)
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 30);
    
    // Countdown timer effect
    const countdownTimer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate.getTime() - now;
      
      if (distance > 0) {
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        // Timer expired
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        clearInterval(countdownTimer);
      }
    }, 1000);
    
    // Initialize timer immediately
    const now = new Date().getTime();
    const distance = targetDate.getTime() - now;
    if (distance > 0) {
      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      setTimeLeft({ days, hours, minutes, seconds });
    }

    // Native animations without anime.js dependency
    const startAnimations = () => {
      console.log('Starting native hero animations...');

      // Animate hero titles with staggered timing
      const heroTitles = document.querySelectorAll('.hero-title');
      heroTitles.forEach((title, index) => {
        setTimeout(() => {
          title.style.transition = 'all 1.2s cubic-bezier(0.16, 1, 0.3, 1)';
          title.style.transform = 'translateY(0px)';
          title.style.opacity = '1';
        }, index * 100);
      });

      // Animate hero main subtitle
      setTimeout(() => {
        const mainSubtitle = document.querySelector('.hero-main-subtitle');
        if (mainSubtitle) {
          mainSubtitle.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
          mainSubtitle.style.transform = 'translateY(0px)';
          mainSubtitle.style.opacity = '1';
        }
      }, 400);

      // Animate other hero subtitles
      setTimeout(() => {
        const subtitles = document.querySelectorAll('.hero-subtitle');
        subtitles.forEach((subtitle, index) => {
          subtitle.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
          subtitle.style.transform = 'translateY(0px)';
          subtitle.style.opacity = '1';
        });
      }, 200);

      // Animate feature pills
      const features = document.querySelectorAll('.hero-features');
      features.forEach((feature, index) => {
        setTimeout(() => {
          feature.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          feature.style.transform = 'translateY(0px)';
          feature.style.opacity = '1';
        }, 600 + (index * 150));
      });

      // Animate CTA buttons
      const buttons = document.querySelectorAll('.hero-buttons');
      buttons.forEach((button, index) => {
        setTimeout(() => {
          button.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
          button.style.transform = 'translateY(0px)';
          button.style.opacity = '1';
        }, 800 + (index * 100));
      });

      // Animate dashboard cards
      const dashboardCards = document.querySelectorAll('.dashboard-card');
      dashboardCards.forEach((card, index) => {
        setTimeout(() => {
          card.style.transition = 'all 1s cubic-bezier(0.16, 1, 0.3, 1)';
          card.style.transform = 'translateX(0px)';
          card.style.opacity = '1';
        }, 400 + (index * 200));
      });



      // Start dashboard animations
      setTimeout(() => {
        console.log('Starting dashboard number animations...');

        // Animate JEE Rank number
        animateNumber('.jee-rank-number', 0, 2847, 2000);

        // Animate Accuracy percentage
        animateNumberWithPercent('.accuracy-number', 0, 87, 1800);

        // Animate progress bars
        setTimeout(() => {
          const physicsBar = document.querySelector('.progress-bar-physics');
          if (physicsBar) {
            physicsBar.style.transition = 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
            physicsBar.style.width = '80%';
          }
        }, 500);

        setTimeout(() => {
          const chemistryBar = document.querySelector('.progress-bar-chemistry');
          if (chemistryBar) {
            chemistryBar.style.transition = 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
            chemistryBar.style.width = '60%';
          }
        }, 700);

        setTimeout(() => {
          const mathsBar = document.querySelector('.progress-bar-maths');
          if (mathsBar) {
            mathsBar.style.transition = 'width 1.5s cubic-bezier(0.16, 1, 0.3, 1)';
            mathsBar.style.width = '70%';
          }
        }, 900);

        // Animate subject performance items
        const performanceItems = document.querySelectorAll('.subject-performance-item');
        performanceItems.forEach((item, index) => {
          setTimeout(() => {
            item.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            item.style.transform = 'translateX(0px)';
            item.style.opacity = '1';
          }, 1000 + (index * 200));
        });

      }, 1200);

      // Start continuous animations
      startContinuousAnimations();
    };

    // Number animation function
    const animateNumber = (selector, start, end, duration) => {
      const element = document.querySelector(selector);
      if (!element) return;

      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function (easeOutExpo)
        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(start + (end - start) * easeOutExpo);

        element.textContent = current.toLocaleString();

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    // Number animation with percentage
    const animateNumberWithPercent = (selector, start, end, duration) => {
      const element = document.querySelector(selector);
      if (!element) return;

      const startTime = performance.now();
      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOutExpo = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
        const current = Math.round(start + (end - start) * easeOutExpo);

        element.textContent = current + '%';

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    // Continuous animations
    const startContinuousAnimations = () => {
      // Floating dashboard animation
      const dashboardCards = document.querySelectorAll('.dashboard-card');
      dashboardCards.forEach((card, index) => {
        setTimeout(() => {
          card.style.animation = 'float 3s ease-in-out infinite';
          card.style.animationDelay = `${index * 0.5}s`;
        }, 2000);
      });

      // Pulsing live indicators
      const liveIndicators = document.querySelectorAll('.live-indicator');
      liveIndicators.forEach(indicator => {
        indicator.style.animation = 'pulse 1.5s ease-in-out infinite';
      });

      // Trending icon animation
      const trendingIcon = document.querySelector('.trending-icon');
      if (trendingIcon) {
        setTimeout(() => {
          trendingIcon.style.animation = 'bounce 2s ease-in-out infinite';
        }, 2000);
      }
    };

    // Start animations after DOM is ready
    const timer = setTimeout(startAnimations, 100);

    // Stats counter animation with intersection observer
    const observerOptions = {
      threshold: 0.5,
      rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateStats();
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    // Features animation with intersection observer
    const featuresObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          // Start the interactive feature animation
          startFeatureAnimation();
          featuresObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });

    if (featuresRef.current) {
      featuresObserver.observe(featuresRef.current);
    }

    // Interactive feature animation function
    const startFeatureAnimation = () => {
      let currentIndex = 0;
      let animationInterval;
      const featureCards = document.querySelectorAll('.feature-card-enhanced');
      const contentPanels = document.querySelectorAll('.content-panel');

      const animateFeature = (index, isSmooth = true) => {
        // Smoothly transition all cards to inactive state
        featureCards.forEach((card) => {
          card.style.transition = isSmooth ? 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.5s ease-out';
          card.style.borderColor = '#e5e7eb';
          card.style.transform = 'scale(1)';
          card.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
          card.style.opacity = '0.7';
        });

        // Smoothly hide all content panels
        contentPanels.forEach(panel => {
          panel.style.transition = 'all 0.8s ease-out';
          panel.style.opacity = '0';
          panel.style.transform = 'translateY(0px)'; // Remove vertical movement to prevent layout shift
          setTimeout(() => {
            panel.style.display = 'none';
            panel.classList.add('hidden');
          }, 400);
        });

        // Smoothly highlight current card with blue outline after a brief delay
        setTimeout(() => {
          if (featureCards[index]) {
            featureCards[index].style.transition = isSmooth ? 'all 1.2s cubic-bezier(0.4, 0, 0.2, 1)' : 'all 0.5s ease-out';
            featureCards[index].style.borderColor = '#3b82f6';
            featureCards[index].style.transform = 'scale(1.02)';
            featureCards[index].style.boxShadow = '0 20px 25px -5px rgba(59, 130, 246, 0.15), 0 10px 10px -5px rgba(59, 130, 246, 0.1)';
            featureCards[index].style.opacity = '1';
          }
        }, isSmooth ? 300 : 0);

        // Show corresponding content panel with smooth animation
        setTimeout(() => {
          if (contentPanels[index]) {
            contentPanels[index].style.display = 'block';
            contentPanels[index].classList.remove('hidden');
            contentPanels[index].style.transition = 'all 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            contentPanels[index].style.opacity = '0';
            contentPanels[index].style.transform = 'translateY(0px)'; // Remove vertical movement

            // Trigger the fade-in animation
            setTimeout(() => {
              contentPanels[index].style.opacity = '1';
              contentPanels[index].style.transform = 'translateY(0)';
            }, 100);
          }
        }, isSmooth ? 500 : 200);
      };

      // Start smooth animation cycle
      const startAnimationCycle = () => {
        animationInterval = setInterval(() => {
          currentIndex = (currentIndex + 1) % featureCards.length;
          animateFeature(currentIndex, true);
        }, 6000); // Slower animation - 6 seconds for better UX
      };

      // Initial animation
      animateFeature(0, false);

      // Start the cycle after initial load
      setTimeout(() => {
        startAnimationCycle();
      }, 2000);

      // Add click handlers for manual control
      featureCards.forEach((card, index) => {
        card.addEventListener('click', () => {
          clearInterval(animationInterval);
          currentIndex = index;
          animateFeature(index, false);

          // Restart auto-animation after 6 seconds
          setTimeout(() => {
            startAnimationCycle();
          }, 6000);
        });
      });
    };

    return () => {
      clearTimeout(timer);
      clearInterval(countdownTimer);
      if (statsRef.current) {
        observer.unobserve(statsRef.current);
      }
      if (featuresRef.current) {
        featuresObserver.unobserve(featuresRef.current);
      }
    };
  }, []);

  // Animation function for traditional coaching section
  const animateTraditionalCoachingSection = () => {
    console.log('Animating traditional coaching section...');

    // Add animation class to section
    const section = document.querySelector('.traditional-coaching-section');
    if (section) {
      section.classList.add('animate-in');
    }

    // Animate section title with subtle effect
    const sectionTitle = document.querySelector('.traditional-coaching-title');
    if (sectionTitle) {
      sectionTitle.style.transform = 'translateY(20px)';
      sectionTitle.style.opacity = '0.7';
      setTimeout(() => {
        sectionTitle.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        sectionTitle.style.transform = 'translateY(0px)';
        sectionTitle.style.opacity = '1';
      }, 200);
    }

    // Animate section subtitle with subtle effect
    const sectionSubtitle = document.querySelector('.traditional-coaching-subtitle');
    if (sectionSubtitle) {
      sectionSubtitle.style.transform = 'translateY(20px)';
      sectionSubtitle.style.opacity = '0.7';
      setTimeout(() => {
        sectionSubtitle.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        sectionSubtitle.style.transform = 'translateY(0px)';
        sectionSubtitle.style.opacity = '1';
      }, 400);
    }

    // Animate section description with subtle effect
    const sectionDesc = document.querySelector('.traditional-coaching-description');
    if (sectionDesc) {
      sectionDesc.style.transform = 'translateY(15px)';
      sectionDesc.style.opacity = '0.8';
      setTimeout(() => {
        sectionDesc.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        sectionDesc.style.transform = 'translateY(0px)';
        sectionDesc.style.opacity = '1';
      }, 600);
    }
  };

  // FAQ toggle function
  const toggleFAQ = (index) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10,}$/.test(formData.phone)) {
      errors.phone = 'Please enter a valid phone number';
    }

    if (!formData.message.trim()) {
      errors.message = 'Message is required';
    }

    return errors;
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    // Handle form submission here (placeholder)
    console.log('Form submitted:', formData);
    alert('Thank you for your message! We will get back to you soon.');

    // Reset form
    setFormData({
      name: '',
      email: '',
      phone: '',
      message: ''
    });
    setFormErrors({});
  };

  const handleStartFreeTrial = () => {
    router.push('/signup');
  };

  // FAQ data
  const faqData = [
    {
      id: 0,
      question: "How effective is online learning compared to traditional coaching?",
      category: "Learning Effectiveness",
      categoryColor: "blue",
      answer: (
        <div>
          <p className="mb-4">Our AI-powered platform has proven to be more effective than traditional coaching for several reasons:</p>
          <ul className="space-y-2 ml-4">
            <li>• <strong>Personalized learning paths</strong> adapt to your unique strengths and weaknesses</li>
            <li>• <strong>Instant feedback</strong> helps you correct mistakes immediately</li>
            <li>• <strong>24/7 access</strong> means you can study at your optimal times</li>
            <li>• <strong>Data shows 85%</strong> of our students improve their scores within 3 months</li>
            <li>• <strong>No time wasted in travel</strong> - more time for actual studying</li>
          </ul>
          <p className="mt-4 text-gray-600">
            Traditional coaching follows a one-size-fits-all approach, while BodhAI customizes everything for you.
          </p>
        </div>
      )
    },
    {
      id: 1,
      question: "What technical requirements do I need to use BodhAI?",
      category: "Technical Requirements",
      categoryColor: "purple",
      answer: (
        <div>
          <p className="mb-4">BodhAI works on any modern device with minimal requirements:</p>
          <ul className="space-y-2 ml-4">
            <li>• <strong>Internet Connection:</strong> Stable broadband (minimum 2 Mbps)</li>
            <li>• <strong>Browser:</strong> Chrome, Firefox, Safari, or Edge (latest versions)</li>
            <li>• <strong>Device:</strong> Computer, tablet, or smartphone</li>
            <li>• <strong>RAM:</strong> Minimum 2GB (4GB recommended)</li>
            <li>• <strong>Storage:</strong> 1GB free space for offline content</li>
          </ul>
          <p className="mt-4 text-gray-600">
            Our platform is optimized for performance and works seamlessly across all devices.
          </p>
        </div>
      )
    },
    {
      id: 2,
      question: "How does the AI personalization actually work?",
      category: "AI Technology",
      categoryColor: "green",
      answer: (
        <div>
          <p className="mb-4">Our advanced AI system creates a unique learning profile for each student:</p>
          <ul className="space-y-2 ml-4">
            <li>• <strong>Performance Analysis:</strong> Tracks your strengths and weak areas in real-time</li>
            <li>• <strong>Learning Style Detection:</strong> Adapts content delivery to your preferred learning method</li>
            <li>• <strong>Difficulty Adjustment:</strong> Automatically adjusts question difficulty based on your progress</li>
            <li>• <strong>Time Optimization:</strong> Suggests optimal study schedules based on your availability</li>
            <li>• <strong>Content Recommendation:</strong> Prioritizes topics that need the most attention</li>
          </ul>
          <p className="mt-4 text-gray-600">
            The AI continuously learns from your interactions to provide increasingly personalized recommendations.
          </p>
        </div>
      )
    },
    {
      id: 3,
      question: "What if I don't see improvement in my scores?",
      category: "Performance Guarantee",
      categoryColor: "orange",
      answer: (
        <div>
          <p className="mb-4">We're confident in our results, which is why we offer multiple guarantees:</p>
          <ul className="space-y-2 ml-4">
            <li>• <strong>30-Day Money-Back Guarantee:</strong> Full refund if you're not satisfied</li>
            <li>• <strong>Score Improvement Promise:</strong> 85% of students see improvement within 3 months</li>
            <li>• <strong>Free Extended Access:</strong> Additional months at no cost if targets aren't met</li>
            <li>• <strong>Personal Mentor Support:</strong> One-on-one guidance to identify improvement areas</li>
            <li>• <strong>Custom Study Plan:</strong> Revised strategy based on your specific needs</li>
          </ul>
          <p className="mt-4 text-gray-600">
            Our success rate speaks for itself, but we stand behind every student's journey.
          </p>
        </div>
      )
    },
    {
      id: 4,
      question: "How secure is my personal data and payment information?",
      category: "Security & Privacy",
      categoryColor: "gray",
      answer: (
        <div>
          <p className="mb-4">Your security and privacy are our top priorities:</p>
          <ul className="space-y-2 ml-4">
            <li>• <strong>Bank-Level Encryption:</strong> 256-bit SSL encryption for all data transmission</li>
            <li>• <strong>Secure Payment Processing:</strong> PCI DSS compliant payment gateways</li>
            <li>• <strong>Data Protection:</strong> GDPR compliant with strict data handling policies</li>
            <li>• <strong>No Data Sharing:</strong> We never sell or share your personal information</li>
            <li>• <strong>Regular Security Audits:</strong> Third-party security assessments and updates</li>
          </ul>
          <p className="mt-4 text-gray-600">
            Your study data and personal information are protected with enterprise-grade security measures.
          </p>
        </div>
      )
    },
    {
      id: 5,
      question: "What happens after my free trial ends?",
      category: "Billing & Plans",
      categoryColor: "cyan",
      answer: (
        <div>
          <p className="mb-4">After your 14-day free trial, you have complete control:</p>
          <ul className="space-y-2 ml-4">
            <li>• <strong>No Automatic Charges:</strong> We'll never charge you without explicit consent</li>
            <li>• <strong>Choose Your Plan:</strong> Select from Foundation, Advanced, or Complete plans</li>
            <li>• <strong>Flexible Billing:</strong> Monthly or annual payment options available</li>
            <li>• <strong>Easy Cancellation:</strong> Cancel anytime with no hidden fees or penalties</li>
            <li>• <strong>Data Retention:</strong> Your progress is saved for 90 days after trial ends</li>
          </ul>
          <p className="mt-4 text-gray-600">
            You'll receive email reminders before your trial ends, giving you time to decide.
          </p>
        </div>
      )
    }
  ];

  const animateStats = () => {

    anime({
      targets: '.stat-number',
      innerHTML: [0, (el) => el.getAttribute('data-count')],
      duration: 2000,
      round: 1,
      easing: 'easeOutExpo'
    });
  };

  return (
    <>
      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.1); }
        }

        @keyframes bounce {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-5px); }
        }

        .hero-title, .hero-subtitle, .hero-main-subtitle, .hero-features, .hero-buttons, .dashboard-card {
          transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        /* Smooth scroll transition effects */
        .traditional-coaching-section {
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .traditional-coaching-title, .traditional-coaching-subtitle, .traditional-coaching-description {
          transition: all 1s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .coaching-problem-card {
          transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }

        .coaching-problem-card:hover {
          transform: translateY(-5px) !important;
        }

        /* Smooth background transition */
        @keyframes fadeInSection {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .traditional-coaching-section.animate-in {
          animation: fadeInSection 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .feature-card {
          animation: fadeInUp 0.8s ease-out both;
          opacity: 0;
          transform: translateY(30px);
        }

        .feature-card:nth-child(1) {
          animation-delay: 0.2s;
        }

        .feature-card:nth-child(2) {
          animation-delay: 0.4s;
        }

        .feature-card:nth-child(3) {
          animation-delay: 0.6s;
        }

        .feature-card:nth-child(4) {
          animation-delay: 0.8s;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .feature-card {
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          opacity: 0.7;
        }

        .feature-card:hover {
          transform: translateY(-2px) !important;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
          opacity: 1 !important;
        }

        .content-panel {
          transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .content-panel.hidden {
          display: none !important;
          opacity: 0 !important;
        }

        /* Smooth border transition */
        .feature-card {
          border-width: 2px;
          border-style: solid;
          border-color: #e5e7eb;
        }

        /* Pricing Section Animations */
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.3); }
          50% { box-shadow: 0 0 30px rgba(59, 130, 246, 0.5); }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        @keyframes priceChange {
          0% { transform: scale(1); }
          50% { transform: scale(1.05); }
          100% { transform: scale(1); }
        }

        .pricing-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .pricing-card:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .popular-card {
          animation: glow 3s ease-in-out infinite;
        }

        .countdown-timer {
          background: linear-gradient(90deg, #ff6b6b, #ffa500, #ff6b6b);
          background-size: 200% 100%;
          animation: shimmer 2s linear infinite;
        }

        .price-animation {
          animation: priceChange 0.5s ease-in-out;
        }

        .toggle-switch {
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .toggle-switch:hover {
          transform: scale(1.05);
        }
        
        .toggle-switch:active {
          transform: scale(0.95);
        }

        .cta-button {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }

        .cta-button::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
          transition: left 0.5s;
        }

        .cta-button:hover::before {
          left: 100%;
        }

        /* Enhanced Feature Section Animations */
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slideInLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .feature-card-enhanced {
          animation: slideInLeft 0.8s ease-out both;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card-enhanced:nth-child(1) { animation-delay: 0.1s; }
        .feature-card-enhanced:nth-child(2) { animation-delay: 0.2s; }
        .feature-card-enhanced:nth-child(3) { animation-delay: 0.3s; }
        .feature-card-enhanced:nth-child(4) { animation-delay: 0.4s; }

        .feature-card-enhanced:hover {
          transform: translateY(-8px) scale(1.02);
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
        }

        .content-panel-enhanced {
          animation: slideInRight 0.6s ease-out both;
          animation-delay: 0.3s;
        }

        .feature-icon {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .feature-card-enhanced:hover .feature-icon {
          transform: scale(1.1) rotate(5deg);
        }

        @keyframes floatSlow {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }

        .float-animation {
          animation: floatSlow 4s ease-in-out infinite;
        }
      `}</style>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <Navbar />

        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
          {/* Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-72 h-72 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse"></div>
            <div className="absolute top-40 right-10 w-72 h-72 bg-purple-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-1000"></div>
            <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-100 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-pulse delay-2000"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              {/* Left Content */}
              <div className="space-y-8">
                {/* Live Stats Badge */}
                <div className="inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-full px-4 py-2 text-sm text-green-700 hero-subtitle">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="font-medium">50,259 students preparing right now</span>
                </div>

                {/* Main Headline */}
                <div className="space-y-4">
                  <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight">
                    <span className="hero-title block opacity-0" style={{ transform: 'translateY(60px)' }}>Crack</span>
                    <span className="hero-title block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent opacity-0" style={{ transform: 'translateY(60px)' }}>JEE/NEET</span>
                    <span className="hero-title block opacity-0" style={{ transform: 'translateY(60px)' }}>with India's #1</span>
                    <span className="hero-title block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent opacity-0" style={{ transform: 'translateY(60px)' }}>AI-Powered Test</span>
                    <span className="hero-title block opacity-0" style={{ transform: 'translateY(60px)' }}>Platform</span>
                  </h1>

                  <p className="hero-main-subtitle text-xl text-gray-600 max-w-lg leading-relaxed opacity-0" style={{ transform: 'translateY(40px)' }}>
                    Get IIT/AIIMS coaching at <span className="font-semibold text-green-600">1/10th the cost</span> with personalized AI analytics
                  </p>
                </div>

                {/* Feature Pills */}
                <div className="flex flex-wrap gap-4">
                  <div className="hero-features flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 opacity-0" style={{ transform: 'translateY(30px)' }}>
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">AI-Powered Analytics</span>
                  </div>
                  <div className="hero-features flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 opacity-0" style={{ transform: 'translateY(30px)' }}>
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Real-time Tracking</span>
                  </div>
                  <div className="hero-features flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 opacity-0" style={{ transform: 'translateY(30px)' }}>
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">Expert Faculty</span>
                  </div>
                  <div className="hero-features flex items-center space-x-2 bg-white rounded-full px-4 py-2 shadow-sm border border-gray-100 opacity-0" style={{ transform: 'translateY(30px)' }}>
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm font-medium text-gray-700">85% Success Rate</span>
                  </div>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="hero-buttons bg-blue-600 hover:bg-blue-700 text-white font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 opacity-0" style={{ transform: 'translateY(20px)' }}>
                    <span>Start Free 14-Day Trial</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button className="hero-buttons border-2 border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-4 px-8 rounded-xl text-lg transition-all duration-300 flex items-center justify-center space-x-2 opacity-0" style={{ transform: 'translateY(20px)' }}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Take Demo Test Now</span>
                  </button>
                </div>
              </div>

              {/* Right Dashboard Preview */}
              <div className="relative min-h-[500px] w-full">
                {/* Floating Profile Card - Positioned first to appear on top */}
                <div className="dashboard-card absolute -top-2 -right-2 bg-white rounded-xl shadow-xl p-4 border border-gray-100 hover:shadow-2xl transition-all duration-300 hover:scale-105 opacity-0 z-30" style={{ transform: 'translateX(100px)' }}>
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center hover:scale-110 transition-transform duration-300 shadow-lg">
                      <span className="text-white font-semibold text-sm">RK</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Rahul K.</p>
                      <p className="text-xs text-gray-500">AIR 247 in JEE</p>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center space-x-2">
                    <div className="live-indicator w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-600">Live</span>
                  </div>
                </div>

                {/* Main Dashboard Card */}
                <div className="dashboard-card bg-white rounded-2xl shadow-2xl p-6 relative z-10 hover:shadow-3xl transition-all duration-300 cursor-pointer group opacity-0 mt-12 mr-8" style={{ transform: 'translateX(100px)' }}>
                  {/* Header */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-lg">B</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">BodhAI Dashboard</h3>
                        <p className="text-sm text-gray-500">Your Performance Overview</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="live-indicator w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-sm text-gray-600">Live</span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    {/* JEE Rank */}
                    <div className="bg-blue-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">JEE Rank</span>
                        <svg className="trending-icon w-4 h-4 text-blue-600 hover:scale-125 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </div>
                      <div className="jee-rank-number text-2xl font-bold text-gray-900">2,847</div>
                    </div>

                    {/* Accuracy */}
                    <div className="bg-green-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-600">Accuracy</span>
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        </div>
                      </div>
                      <div className="accuracy-number text-2xl font-bold text-green-600">87%</div>
                    </div>
                  </div>

                  {/* Subject Performance */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-600 mb-4">Subject Performance</h4>
                    <div className="space-y-3">
                      <div className="subject-performance-item flex items-center justify-between">
                        <span className="text-sm text-gray-700">Physics</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="progress-bar-physics h-2 bg-blue-600 rounded-full transition-all duration-1000" style={{ width: '80%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">80%</span>
                        </div>
                      </div>
                      <div className="subject-performance-item flex items-center justify-between">
                        <span className="text-sm text-gray-700">Chemistry</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="progress-bar-chemistry h-2 bg-cyan-500 rounded-full transition-all duration-1000" style={{ width: '90%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">90%</span>
                        </div>
                      </div>
                      <div className="subject-performance-item flex items-center justify-between">
                        <span className="text-sm text-gray-700">Maths</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div className="progress-bar-maths h-2 bg-purple-500 rounded-full transition-all duration-1000" style={{ width: '70%' }}></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900">70%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Traditional Coaching Isn't Working Section */}
        <section className="traditional-coaching-section py-20 bg-gray-50 relative overflow-hidden">
          {/* Subtle background transition elements */}
          <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-gray-50 opacity-50"></div>
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-slate-50 via-blue-50 to-transparent opacity-30"></div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="traditional-coaching-title text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Why Traditional Coaching
              </h2>
              <h2 className="traditional-coaching-subtitle text-4xl md:text-5xl font-bold text-red-600 mb-6">
                Isn't Working Anymore?
              </h2>
              <p className="traditional-coaching-description text-xl text-gray-600 max-w-4xl mx-auto">
                Thousands of students and parents are struggling with outdated coaching methods. Here's what's holding them back from achieving their dreams.
              </p>
            </div>

            <div className="grid md:grid-cols-4 gap-6">
              {/* Expensive Coaching Fees */}
              <div className="coaching-problem-card bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300 hover:scale-105" data-index="0">
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Expensive Coaching Fees</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  ₹2-3 lakhs annually for quality coaching
                </p>
                <div className="text-3xl font-bold text-red-600 mb-2">₹3.5L</div>
                <p className="text-sm text-gray-500">Average Annual Cost</p>
              </div>

              {/* Time Wastage in Travel */}
              <div className="coaching-problem-card bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300 hover:scale-105" data-index="1">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Time Wastage in Travel</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  2-4 hours daily commuting to coaching centers
                </p>
                <div className="text-3xl font-bold text-orange-600 mb-2">3.2 hrs</div>
                <p className="text-sm text-gray-500">Daily Travel Time</p>
              </div>

              {/* Lack of Personal Attention */}
              <div className="coaching-problem-card bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300 hover:scale-105" data-index="2">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">Lack of Personal Attention</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  1 teacher for 100+ students in batch coaching
                </p>
                <div className="text-3xl font-bold text-blue-600 mb-2">1:100</div>
                <p className="text-sm text-gray-500">Teacher Student Ratio</p>
              </div>

              {/* No Progress Tracking */}
              <div className="coaching-problem-card bg-white rounded-2xl p-8 shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300 hover:scale-105" data-index="3">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4">No Progress Tracking</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Students don't know their weak areas until it's too late
                </p>
                <div className="text-3xl font-bold text-purple-600 mb-2">78%</div>
                <p className="text-sm text-gray-500">Students Lack Clarity</p>
              </div>
            </div>
          </div>
        </section>

        {/* Real Stories from Frustrated Parents */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Real Stories from Frustrated Parents
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Don't let your child's dreams suffer like these families did
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-16">
              {/* Rajesh Kumar Testimonial */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">RK</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Rajesh Kumar</h4>
                    <p className="text-gray-600">Parent of JEE Aspirant</p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Delhi
                    </p>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic text-lg leading-relaxed mb-6">
                  "We spent ₹4 lakhs on coaching for our son, but he still couldn't crack JEE. The batch size was too large, and teachers couldn't give individual attention. We wish we had found a better solution earlier."
                </blockquote>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>

              {/* Sunita Sharma Testimonial */}
              <div className="bg-gray-50 rounded-2xl p-8 border border-gray-100">
                <div className="flex items-start space-x-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-xl">SS</span>
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-900">Sunita Sharma</h4>
                    <p className="text-gray-600">Mother of NEET Aspirant</p>
                    <p className="text-sm text-gray-500 flex items-center mt-1">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Mumbai
                    </p>
                  </div>
                </div>
                <blockquote className="text-gray-700 italic text-lg leading-relaxed mb-6">
                  "My daughter used to travel 2 hours daily to coaching. By the time she reached home, she was exhausted. Online learning seemed risky, but traditional coaching wasn't working either."
                </blockquote>
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>

            {/* Call to Action Box */}
            <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-8 border border-red-100 text-center">
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                Don't Let Your Child Become Another Statistic
              </h3>
              <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
                Every year, thousands of talented students miss their dream colleges due to ineffective preparation methods. It's time for a smarter approach.
              </p>
              <div className="flex items-center justify-center space-x-2 text-red-600 font-semibold">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <span className="text-lg">Limited seats available for this academic year</span>
              </div>
            </div>
          </div>
        </section>

        {/* Meet Your AI-Powered Exam Preparation Solution Section */}
        <section ref={featuresRef} className="py-24 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 relative overflow-hidden">
          {/* Enhanced Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse"></div>
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-pulse delay-1000"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-br from-indigo-200 to-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-2000"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-20">
              <div className="inline-flex items-center space-x-2 bg-blue-100 border border-blue-200 rounded-full px-6 py-3 text-sm text-blue-700 mb-6 animate-bounce">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-semibold">Revolutionary AI Technology</span>
              </div>

              <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-8 leading-tight">
                Meet Your{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 animate-gradient">
                  AI-Powered
                </span>
                <br />
                <span className="text-gray-900">Exam Preparation</span>
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  Solution
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
                BodhAI combines cutting-edge AI technology with expert teaching to deliver
                personalized learning experiences that adapt to your unique needs.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-12 items-start">
              {/* Left Side - Enhanced Feature Cards */}
              <div className="space-y-6 relative">
                {/* AI-Powered Personalization Card */}
                <div id="feature-0" className="feature-card-enhanced group bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-50 to-purple-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="feature-icon w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors duration-300">AI-Powered Personalization</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Our AI analyzes your performance and creates personalized study plans that evolve with your progress</p>
                        <div className="mt-3 flex items-center text-blue-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-xs">Learn more</span>
                          <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Real-Time Analytics Card */}
                <div id="feature-1" className="feature-card-enhanced group bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-50 to-pink-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="feature-icon w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-purple-600 transition-colors duration-300">Real-Time Analytics</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Get instant insights into your performance and progress with detailed analytics and predictions</p>
                        <div className="mt-3 flex items-center text-purple-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-xs">Learn more</span>
                          <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expert Faculty Access Card */}
                <div id="feature-2" className="feature-card-enhanced group bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-50 to-blue-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="feature-icon w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors duration-300">Expert Faculty Access</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Learn from IIT/AIIMS graduates and top educators with 24/7 doubt resolution support</p>
                        <div className="mt-3 flex items-center text-indigo-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-xs">Learn more</span>
                          <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cost-Effective Learning Card */}
                <div id="feature-3" className="feature-card-enhanced group bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-100 cursor-pointer hover:shadow-xl hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-green-50 to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="relative z-10">
                    <div className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="feature-icon w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-500">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-green-600 transition-colors duration-300">Cost-Effective Learning</h3>
                        <p className="text-gray-600 text-sm leading-relaxed">Get premium coaching at 90% less cost than traditional institutes with guaranteed results</p>
                        <div className="mt-3 flex items-center text-green-600 font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                          <span className="text-xs">Learn more</span>
                          <svg className="w-3 h-3 ml-1 transform group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Side - Enhanced Dynamic Content */}
              <div className="lg:pl-6">
                <div id="dynamic-content" className="content-panel-enhanced bg-white rounded-2xl p-6 shadow-xl border border-gray-200 relative overflow-hidden float-animation min-h-[480px] flex flex-col">
                  {/* Animated background gradient */}
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 opacity-50"></div>

                  {/* Default Content - AI-Powered Personalization */}
                  <div id="content-0" className="content-panel relative z-10">
                    <div className="flex items-start space-x-4 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">AI-Powered Personalization</h3>
                        <p className="text-gray-600 leading-relaxed">Our advanced AI analyzes your performance patterns and creates personalized study plans that evolve with your progress</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                        <div className="w-2 h-2 bg-blue-500 rounded-full mr-2 animate-pulse"></div>
                        Key Features:
                      </h4>
                      <div className="grid grid-cols-1 gap-3">
                        <div className="flex items-center text-green-600 bg-green-50 rounded-lg p-3 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                          <span className="text-sm font-medium">Identifies weak areas in real-time</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-lg p-3 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                          <span className="text-sm font-medium">Adapts question difficulty based on performance</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-lg p-3 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                          <span className="text-sm font-medium">Provides personalized study recommendations</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-lg p-3 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-2 h-2 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                          <span className="text-sm font-medium">Tracks improvement patterns</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-200">
                      <div className="flex justify-between items-center text-sm mb-3">
                        <span className="text-gray-700 font-bold">Traditional vs AI-Powered:</span>
                      </div>
                      <div className="flex items-center justify-between bg-white rounded-lg p-3 shadow-sm">
                        <div className="flex items-center text-red-500">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">One-size-fits-all approach</span>
                        </div>
                        <div className="flex items-center text-green-500">
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-medium">Personalized for each student</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Hidden Content Panels */}
                  <div id="content-1" className="content-panel hidden relative z-10" style={{display: 'none'}}>
                    <div className="flex items-start space-x-6 mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-3">Real-Time Analytics</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">Get instant insights into your performance and progress with detailed analytics and predictions</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <div className="w-3 h-3 bg-purple-500 rounded-full mr-3 animate-pulse"></div>
                        Key Features:
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">Live performance tracking</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">Detailed subject-wise analysis</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">Rank prediction algorithms</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">Progress visualization</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-2xl p-6 border border-gray-200">
                      <div className="flex justify-between items-center text-sm mb-4">
                        <span className="text-gray-700 font-bold text-lg">Traditional vs AI-Powered:</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center text-red-500">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Results after months</span>
                          </div>
                          <div className="flex items-center text-green-500">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Instant feedback & analysis</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="content-2" className="content-panel hidden relative z-10" style={{display: 'none'}}>
                    <div className="flex items-start space-x-6 mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-3">Expert Faculty Access</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">Learn from IIT/AIIMS graduates and top educators with 24/7 doubt resolution support</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <div className="w-3 h-3 bg-indigo-500 rounded-full mr-3 animate-pulse"></div>
                        Key Features:
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">Video solutions by IIT/AIIMS faculty</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">Live doubt clearing sessions</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">Concept explanation videos</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">24/7 expert support</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-indigo-50 rounded-2xl p-6 border border-gray-200">
                      <div className="flex justify-between items-center text-sm mb-4">
                        <span className="text-gray-700 font-bold text-lg">Traditional vs AI-Powered:</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center text-red-500">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Limited teacher interaction</span>
                          </div>
                          <div className="flex items-center text-green-500">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Unlimited expert access</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div id="content-3" className="content-panel hidden relative z-10" style={{display: 'none'}}>
                    <div className="flex items-start space-x-6 mb-8">
                      <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-3xl font-bold text-gray-900 mb-3">Cost-Effective Learning</h3>
                        <p className="text-gray-600 text-lg leading-relaxed">Get premium coaching at 90% less cost than traditional institutes with guaranteed results</p>
                      </div>
                    </div>

                    <div className="mb-8">
                      <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                        <div className="w-3 h-3 bg-green-500 rounded-full mr-3 animate-pulse"></div>
                        Key Features:
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">90% less than traditional coaching</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">No hidden fees or charges</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">Flexible payment options</span>
                        </div>
                        <div className="flex items-center text-green-600 bg-green-50 rounded-xl p-4 transform hover:scale-105 transition-transform duration-300">
                          <div className="w-3 h-3 bg-green-500 rounded-full mr-4 animate-pulse"></div>
                          <span className="font-medium">Money-back guarantee</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-2xl p-6 border border-gray-200">
                      <div className="flex justify-between items-center text-sm mb-4">
                        <span className="text-gray-700 font-bold text-lg">Traditional vs AI-Powered:</span>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between bg-white rounded-xl p-4 shadow-sm">
                          <div className="flex items-center text-red-500">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">₹2-5 Lakhs per year</span>
                          </div>
                          <div className="flex items-center text-green-500">
                            <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">Starting ₹999/month</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>







        {/* Pricing Section */}
        <section ref={pricingRef} className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Choose Your Path to{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Success
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                Get premium JEE/NEET coaching at 90% less cost than traditional institutes. All plans include 14-day free trial with money-back guarantee.
              </p>
            </div>

            {/* Limited Time Offer Banner */}
            <div className="mb-12 flex justify-center">
              <div className="countdown-timer bg-gradient-to-r from-red-500 to-orange-500 text-white px-8 py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <div className="font-bold text-lg">Limited Time Offer</div>
                    <div className="text-xl font-bold">50% OFF Annual Plans</div>
                  </div>
                </div>
                <div className="text-center mt-2 font-semibold">
                  Offer expires in: {timeLeft.days}d {String(timeLeft.hours).padStart(2, '0')}h {String(timeLeft.minutes).padStart(2, '0')}m {String(timeLeft.seconds).padStart(2, '0')}s
                </div>
              </div>
            </div>

            {/* Billing Toggle */}
            <div className="flex justify-center mb-12">
              <div className="flex items-center space-x-4 bg-white rounded-full p-2 shadow-lg">
                <span className={`px-4 py-2 rounded-full transition-all duration-200 ${!isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                  Monthly
                </span>
                <button
                  onClick={() => setIsAnnual(!isAnnual)}
                  className={`relative w-16 h-8 rounded-full transition-all duration-200 ease-in-out ${isAnnual ? 'bg-blue-600' : 'bg-gray-300'}`}
                >
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-200 ease-in-out transform ${isAnnual ? 'translate-x-8' : 'translate-x-1'}`} />
                </button>
                <span className={`px-4 py-2 rounded-full transition-all duration-200 ${isAnnual ? 'text-gray-900 font-semibold' : 'text-gray-500'}`}>
                  Annual
                </span>
                <span className={`bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold transition-all duration-300 ${isAnnual ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
                  Save 50%
                </span>
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {/* Foundation Plan */}
              <div className="pricing-card bg-white rounded-3xl shadow-xl p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Foundation</h3>
                  <p className="text-gray-600 mb-6">Perfect for beginners starting their JEE/NEET preparation</p>

                  <div className="mb-6">
                    <div className="price-animation text-4xl font-bold text-gray-900">
                      ₹{isAnnual ? '7,999' : '999'}
                      <span className="text-lg text-gray-500 font-normal">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    {isAnnual && (
                      <div className="text-gray-500 line-through">₹19,999</div>
                    )}
                    <div className="text-green-600 font-semibold">
                      Just ₹{isAnnual ? '22' : '33'}/day
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">5,000+ Practice Questions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Basic Performance Analytics</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Subject-wise Tests</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Video Solutions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Mobile App Access</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Email Support</span>
                    </div>
                    <div className="flex items-center space-x-3 opacity-50">
                      <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-400">Limited mock tests (10/month)</span>
                    </div>
                    <div className="flex items-center space-x-3 opacity-50">
                      <div className="w-5 h-5 bg-gray-300 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-400">Basic doubt clearing</span>
                    </div>
                  </div>

                  <button className="cta-button w-full bg-gray-900 text-white py-4 rounded-2xl font-semibold hover:bg-gray-800 shadow-lg">
                    Start Free Trial →
                  </button>
                </div>
              </div>

              {/* Advanced Plan - Most Popular */}
              <div className="pricing-card popular-card bg-white rounded-3xl shadow-xl p-8 border-4 border-blue-500 relative">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-6 py-2 rounded-full text-sm font-bold">
                    Most Popular
                  </span>
                </div>

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Advanced</h3>
                  <p className="text-gray-600 mb-6">Most popular choice for serious JEE/NEET aspirants</p>

                  <div className="mb-6">
                    <div className="price-animation text-4xl font-bold text-gray-900">
                      ₹{isAnnual ? '11,999' : '1,499'}
                      <span className="text-lg text-gray-500 font-normal">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    {isAnnual && (
                      <div className="text-gray-500 line-through">₹29,999</div>
                    )}
                    <div className="text-green-600 font-semibold">
                      Save ₹{isAnnual ? '18,000' : '0'}
                    </div>
                    <div className="text-blue-600 font-semibold">
                      Just ₹{isAnnual ? '33' : '49'}/day
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">15,000+ Practice Questions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Advanced AI Analytics</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Unlimited Mock Tests</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Live Doubt Clearing Sessions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Personalized Study Plans</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Performance Comparison</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Mobile + Web Access</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Priority Support</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Previous Year Papers</span>
                    </div>
                  </div>

                  <button className="cta-button w-full bg-blue-600 text-white py-4 rounded-2xl font-semibold hover:bg-blue-700 shadow-lg">
                    Start Free Trial →
                  </button>
                </div>
              </div>

              {/* Complete Plan */}
              <div className="pricing-card bg-white rounded-3xl shadow-xl p-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Complete</h3>
                  <p className="text-gray-600 mb-6">Ultimate package with everything you need to crack JEE/NEET</p>

                  <div className="mb-6">
                    <div className="price-animation text-4xl font-bold text-gray-900">
                      ₹{isAnnual ? '15,999' : '1,999'}
                      <span className="text-lg text-gray-500 font-normal">
                        /{isAnnual ? 'year' : 'month'}
                      </span>
                    </div>
                    {isAnnual && (
                      <div className="text-gray-500 line-through">₹39,999</div>
                    )}
                    <div className="text-green-600 font-semibold">
                      Save ₹{isAnnual ? '24,000' : '0'}
                    </div>
                    <div className="text-purple-600 font-semibold">
                      Just ₹{isAnnual ? '44' : '66'}/day
                    </div>
                  </div>

                  <div className="space-y-4 mb-8 text-left">
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">25,000+ Practice Questions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">AI-Powered Rank Prediction</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Unlimited Everything</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">1-on-1 Mentorship Sessions</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Custom Study Materials</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Live Classes by IIT/AIIMS Faculty</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Instant Doubt Resolution</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">College Counseling</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">Scholarship Guidance</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-gray-700">24/7 Premium Support</span>
                    </div>
                  </div>

                  <button className="cta-button w-full bg-purple-600 text-white py-4 rounded-2xl font-semibold hover:bg-purple-700 shadow-lg">
                    Start Free Trial →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* BodhAI vs Traditional Coaching Comparison Section */}
        <section className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                BodhAI vs Traditional Coaching
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                See how much you can save while getting better results
              </p>
            </div>

            {/* Comparison Cards */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              {/* Traditional Coaching */}
              <div className="bg-red-50 border-2 border-red-200 rounded-3xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-red-600 mb-6 text-center">Traditional Coaching</h3>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-red-600">₹2,50,000 - ₹5,00,000</div>
                  <div className="text-gray-600">+ ₹985 - ₹1,370 per day</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Fixed batch timings</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Limited personal attention</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Travel time required</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">No flexibility</span>
                  </div>
                </div>
              </div>

              {/* BodhAI Complete */}
              <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-8 shadow-lg">
                <h3 className="text-2xl font-bold text-green-600 mb-6 text-center">BodhAI Complete</h3>
                <div className="text-center mb-6">
                  <div className="text-3xl font-bold text-green-600">₹15,999</div>
                  <div className="text-gray-600">₹44 per day</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">24/7 access</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Personalized learning</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Study from anywhere</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center mr-3">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700">Complete flexibility</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Money-Back Guarantee */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-200 max-w-2xl mx-auto text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">100% Money-Back Guarantee</h3>
              <p className="text-gray-600 mb-6">
                Not satisfied with your progress in the first 30 days? Get a full refund, no questions asked. We're confident in our AI-powered approach.
              </p>
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-500">
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  14-day free trial
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  30-day money back
                </div>
                <div className="flex items-center">
                  <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Cancel anytime
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Frequently Asked{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">
                  Questions
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get answers to common questions about BodhAI. Still have questions? Our support team is here to help 24/7.
              </p>
            </div>

            {/* Category Tags */}
            <div className="flex flex-wrap justify-center gap-3 mb-12">
              <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">Learning Effectiveness</span>
              <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">Technical Requirements</span>
              <span className="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium">AI Technology</span>
              <span className="px-4 py-2 bg-orange-100 text-orange-700 rounded-full text-sm font-medium">Performance Guarantee</span>
              <span className="px-4 py-2 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">Mock Tests</span>
              <span className="px-4 py-2 bg-pink-100 text-pink-700 rounded-full text-sm font-medium">Support & Mentorship</span>
              <span className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm font-medium">Security & Privacy</span>
              <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-medium">Billing & Plans</span>
            </div>

            {/* FAQ Items */}
            <div className="space-y-6">
              {faqData.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-gray-50 rounded-2xl border border-gray-200 hover:shadow-lg transition-all duration-300 overflow-hidden"
                >
                  <div
                    className="p-6 cursor-pointer hover:bg-gray-100 transition-colors duration-200"
                    onClick={() => toggleFAQ(faq.id)}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {faq.question}
                        </h3>
                        <span className={`inline-block px-3 py-1 bg-${faq.categoryColor}-100 text-${faq.categoryColor}-700 rounded-full text-xs font-medium`}>
                          {faq.category}
                        </span>
                      </div>
                      <div className="ml-4">
                        <svg
                          className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${expandedFAQ === faq.id ? 'rotate-180' : ''
                            }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Answer Content */}
                  <div
                    className={`transition-all duration-300 ease-in-out ${expandedFAQ === faq.id
                      ? 'max-h-96 opacity-100'
                      : 'max-h-0 opacity-0'
                      } overflow-hidden`}
                  >
                    <div className="px-6 pb-6 text-gray-700 leading-relaxed">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Still Have Questions Section */}
        <section className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl p-8 md:p-12 text-center shadow-xl">
              {/* Icon */}
              <div className="flex justify-center mb-6">
                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
              </div>

              {/* Title */}
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Still Have Questions?
              </h2>

              {/* Description */}
              <p className="text-lg text-gray-700 mb-8 max-w-2xl mx-auto">
                Our expert counselors are available 24/7 to help you choose the right plan and answer any questions about your exam preparation journey.
              </p>

              {/* Contact Options */}
              <div className="grid md:grid-cols-3 gap-6">
                {/* Call Us */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mx-auto mb-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Call Us</h3>
                  <p className="text-blue-600 font-medium">+91 9875 4320</p>
                </div>

                {/* Email Us */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mx-auto mb-4">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Email Us</h3>
                  <p className="text-purple-600 font-medium">help@BodhAI.in</p>
                </div>

                {/* Live Chat */}
                <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200">
                  <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mx-auto mb-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Live Chat</h3>
                  <p className="text-green-600 font-medium">Available 24/7</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Start Your Free Trial Section */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-16 items-center">

              {/* Left Side - Content */}
              <div>
                <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
                  Start Your
                  <span className="text-blue-600"> Free Trial</span>
                  <span className="text-teal-500"> Today</span>
                </h2>

                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  Join 50,000+ students who are already using AI to crack JEE/NEET. Get instant access to our complete platform for 14 days, absolutely free.
                </p>

                {/* Features List */}
                <div className="space-y-6 mb-8">
                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Instant Access</h3>
                      <p className="text-gray-600">Start practicing immediately after signup</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">5,000+ Questions</h3>
                      <p className="text-gray-600">Access to our complete question bank</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">AI Analytics</h3>
                      <p className="text-gray-600">Personalized performance insights</p>
                    </div>
                  </div>

                  <div className="flex items-start">
                    <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4 flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">Expert Support</h3>
                      <p className="text-gray-600">Get help from IIT/AIIMS faculty</p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">50K+</div>
                    <div className="text-sm text-gray-600">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-1">4.9/5</div>
                    <div className="text-sm text-gray-600">Rating</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-1">85%</div>
                    <div className="text-sm text-gray-600">Success Rate</div>
                  </div>
                </div>
              </div>

              {/* Right Side - Signup Form Card */}
              <div className="relative">
                <div className="bg-white rounded-3xl p-8 shadow-2xl border border-gray-100 max-w-md mx-auto">
                  {/* Progress Bar */}
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-sm text-gray-500">Step 1 of 2</span>
                    <span className="text-sm font-semibold text-blue-600">50%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
                    <div className="bg-blue-600 h-2 rounded-full w-1/2"></div>
                  </div>

                  {/* Form Header */}
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Let's Get Started</h3>
                    <p className="text-gray-600">Tell us about yourself to personalize your experience</p>
                  </div>

                  {/* Form */}
                  <form className="space-y-4">
                    <div>
                      <input
                        type="text"
                        placeholder="Full Name"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <input
                        type="tel"
                        placeholder="Phone Number"
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700">
                        <option>JEE Main</option>
                        <option>JEE Advanced</option>
                        <option>NEET</option>
                      </select>
                      <select className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700">
                        <option>12th</option>
                        <option>11th</option>
                        <option>Dropper</option>
                      </select>
                    </div>

                    <div>
                      <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-500">
                        <option>Select Your City</option>
                        <option>Delhi</option>
                        <option>Mumbai</option>
                        <option>Bangalore</option>
                        <option>Chennai</option>
                        <option>Kolkata</option>
                        <option>Hyderabad</option>
                        <option>Pune</option>
                        <option>Other</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      onClick={handleStartFreeTrial}
                      className="w-full bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center"
                    >
                      Continue
                      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Professional Footer */}
        <footer className="bg-slate-800 text-gray-300 py-16">
          <div className="max-w-7xl mx-auto px-6">
            {/* Main Footer Content */}
            <div className="grid md:grid-cols-5 gap-8 mb-12">
              {/* Brand Section */}
              <div className="md:col-span-1">
                <div className="flex items-center mb-4">
                  <img 
                    src="/Bodh_Main_Full.png" 
                    alt="Bodh.ai Logo" 
                    className="h-8 w-auto object-contain"
                  />
                </div>
                <p className="text-gray-400 text-sm leading-relaxed mb-6">
                  India's most trusted AI-powered exam preparation platform. Helping 50,000+ students crack JEE/NEET with personalized learning and expert guidance at affordable prices.
                </p>
                <div className="space-y-2 text-sm text-gray-400">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    +91 98765 43210
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    support@bodh.ai
                  </div>
                  <div className="text-gray-400">Bangalore, Karnataka, India</div>
                </div>
                
                {/* Social Media Icons */}
                <div className="flex space-x-4 mt-6">
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-white transition-colors">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24.009 12.017 24.009c6.624 0 11.99-5.367 11.99-11.988C24.007 5.367 18.641.001.012.001z"/>
                    </svg>
                  </a>
                </div>
              </div>

              {/* Product Column */}
              <div>
                <h4 className="text-white font-semibold mb-4">Product</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Demo Test</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Success Stories</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
                </ul>
              </div>

              {/* Exam Prep Column */}
              <div>
                <h4 className="text-white font-semibold mb-4">Exam Prep</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">JEE Main Preparation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">JEE Advanced</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">NEET Preparation</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Mock Tests</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Previous Year Papers</a></li>
                </ul>
              </div>

              {/* Support Column */}
              <div>
                <h4 className="text-white font-semibold mb-4">Support</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Live Chat</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">WhatsApp Support</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">FAQ</a></li>
                </ul>
              </div>

              {/* Company Column */}
              <div>
                <h4 className="text-white font-semibold mb-4">Company</h4>
                <ul className="space-y-3 text-sm text-gray-400">
                  <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Partnerships</a></li>
                  <li><a href="#" className="hover:text-white transition-colors">Download App</a></li>
                  <li className="pt-2">
                    <div className="flex space-x-2">
                      <a href="#" className="inline-block">
                        <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on App Store" className="h-8" />
                      </a>
                      <a href="#" className="inline-block">
                        <img src="https://play.google.com/intl/en_us/badges/static/images/badges/en_badge_web_generic.png" alt="Get it on Google Play" className="h-8" />
                      </a>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            {/* Trust Badges */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-t border-gray-700">
              <div className="text-center">
                <div className="text-white font-semibold text-sm mb-1">ISO Certified</div>
                <div className="text-gray-400 text-xs">ISO 27001 Certified</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold text-sm mb-1">Secure Payments</div>
                <div className="text-gray-400 text-xs">SSL Encrypted</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold text-sm mb-1">GDPR Compliant</div>
                <div className="text-gray-400 text-xs">Data Protection</div>
              </div>
              <div className="text-center">
                <div className="text-white font-semibold text-sm mb-1">99.9% Uptime</div>
                <div className="text-gray-400 text-xs">Always Online</div>
              </div>
            </div>

            {/* Newsletter Section */}
            <div className="py-8 border-t border-gray-700">
              <div className="text-center mb-6">
                <h3 className="text-white font-semibold text-lg mb-2">Stay Updated with Exam Tips</h3>
                <p className="text-gray-400 text-sm">Get weekly study tips, exam updates, and success stories delivered to your inbox.</p>
              </div>
              <div className="flex justify-center">
                <div className="flex max-w-md w-full">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-gray-700 text-white rounded-l-lg border border-gray-600 focus:outline-none focus:border-blue-500"
                  />
                  <button className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-r-lg hover:bg-blue-700 transition-colors">
                    Subscribe
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Footer */}
            <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
              <div className="text-gray-400 text-sm mb-4 md:mb-0">
                © 2024 Bodh.ai. All rights reserved. Made with ❤️ for Indian students.
              </div>
              <div className="flex space-x-6 text-sm text-gray-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="#" className="hover:text-white transition-colors">Refund Policy</a>
                <a href="#" className="hover:text-white transition-colors">Cookie Policy</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
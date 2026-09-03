import React, { useState } from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { useQuery } from "react-query";
import { api } from "../../util/axios";
import {
  Card,
  Typography,
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  IconButton,
  Avatar,
} from "@material-tailwind/react";
import {
  PlayIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ChatBubbleLeftRightIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  BookOpenIcon,
  CheckCircleIcon,
  XMarkIcon,
  SparklesIcon,
  PhoneIcon,
  ClockIcon,
  UserGroupIcon,
  VideoCameraIcon,
} from "@heroicons/react/24/outline";
import ReactPlayer from "react-player";
import whatsappIcon from "./wp.png";
import member1 from "./members/1.jpeg";
import member2 from "./members/2.jpeg";
import member3 from "./members/3.jpeg";

const trainingCourses = [
  {
    id: 1,
    title: "কিভাবে টাস্ক খুঁজে পাবেন ও সম্পূর্ণ করবেন",
    subtitle: "টাস্ক খোঁজার সঠিক উপায় এবং সফলভাবে সম্পন্ন করার নিয়ম শিখুন।",
    lessons: "12 টি লেসন",
    level: "শুরুকারীদের জন্য",
    bg: "from-teal-600 via-cyan-600 to-teal-800",
    icon: "💻",
    tagColor: "bg-primary-light text-primary",
    videoUrl: "https://www.youtube.com/watch?v=yTByYhrqrXo",
    topics: [
      "১. ড্যাশবোর্ড থেকে উপযুক্ত টাস্ক নির্বাচন করা",
      "২. কাজের শর্ত ও রুলস সতর্কতার সাথে পড়া",
      "৩. প্রুফ ও স্ক্রিনশট সঠিক নিয়মে সাবমিট করা",
    ],
  },
  {
    id: 2,
    title: "কিভাবে আপনার আয় বাড়াবেন",
    subtitle: "স্মার্ট টিপস ও স্ট্র্যাটেজি ব্যবহার করে আপনার দৈনিক আয় বাড়ান।",
    lessons: "8 টি লেসন",
    level: "ইন্টারমিডিয়েট",
    bg: "from-emerald-500 via-teal-600 to-emerald-700",
    icon: "📈",
    tagColor: "bg-emerald-50 text-emerald-600",
    videoUrl: "https://www.youtube.com/watch?v=yTByYhrqrXo",
    topics: [
      "১. হাই-পেয়িং টাস্কগুলোতে অগ্রাধিকার দেওয়া",
      "২. রেফারেল নেটওয়ার্ক গঠন করে প্যাসিভ ইনকাম",
      "৩. ডেইলি বোনাস ও রেগুলার অ্যাক্টিভিটি ট্র্যাকিং",
    ],
  },
  {
    id: 3,
    title: "রিজেকশন এড়ানোর উপায়",
    subtitle: "ভুলগুলো এড়িয়ে চলুন এবং আপনার একাউন্ট নিরাপদ রাখুন।",
    lessons: "10 টি লেসন",
    level: "সকল লেভেলের জন্য",
    bg: "from-amber-500 via-orange-600 to-amber-700",
    icon: "🛡️",
    tagColor: "bg-amber-50 text-amber-600",
    videoUrl: "https://www.youtube.com/watch?v=yTByYhrqrXo",
    topics: [
      "১. ফেক বা ভুল ট্রানজেকশন আইডি সাবমিট না করা",
      "২. ভিডিও টাস্কে নির্দিষ্ট সময় পর্যন্ত সক্রিয় থাকা",
      "৩. প্ল্যাটফর্ম রুলস অমান্য করার ঝুঁকি ও সমাধান",
    ],
  },
  {
    id: 4,
    title: "উইথড্রয়াল ও পেমেন্ট গাইড",
    subtitle: "উইথড্রয়াল ও পেমেন্টের সম্পূর্ণ প্রসেস ধাপে ধাপে শিখুন।",
    lessons: "6 টি লেসন",
    level: "শুরুকারীদের জন্য",
    bg: "from-pink-500 via-rose-600 to-teal-600",
    icon: "👛",
    tagColor: "bg-pink-50 text-pink-600",
    videoUrl: "https://www.youtube.com/watch?v=yTByYhrqrXo",
    topics: [
      "১. bKash, Nagad ও Rocket একাউন্ট ভেরিফিকেশন",
      "২. সর্বনিম্ন উইথড্রয়াল সীমা ও চার্জ সংক্রান্ত তথ্য",
      "৩. পেমেন্ট রিকুয়েস্ট সফল হওয়ার সময়সীমা",
    ],
  },
];

const TRAINING_QUICK_ACTIONS = [
  {
    id: 1,
    title: "টাস্ক মার্কেটপ্লেস",
    subtitle: "কাজ করুন ও আয় করুন",
    icon: PlayIcon,
    to: "/user/tasks",
    color: "#0D9488",
    bg: "bg-teal-50",
  },
  {
    id: 2,
    title: "গাইড",
    subtitle: "ধাপে ধাপে শিখুন",
    icon: DocumentTextIcon,
    to: "/how-it-works",
    color: "#0284c7",
    bg: "bg-sky-50",
  },
  {
    id: 3,
    title: "টিপস ও ট্রিকস",
    subtitle: "কাজকে করুন সহজ",
    icon: LightBulbIcon,
    to: "/tips",
    color: "#f59e0b",
    bg: "bg-amber-50",
  },
  {
    id: 4,
    title: "দ্রুত উত্তর",
    subtitle: "তাৎক্ষণিক সমাধান পান",
    icon: ChatBubbleLeftRightIcon,
    to: "/message",
    color: "#ec4899",
    bg: "bg-pink-50",
  },
  {
    id: 5,
    title: "নীতিমালা",
    subtitle: "নিয়মগুলো জেনে নিন",
    icon: ShieldCheckIcon,
    to: "/how-it-works",
    color: "#10b981",
    bg: "bg-emerald-50",
  },
];

const TRAINING_TRAINERS = [
  {
    name: "Promity Remeen",
    title: "CNP Promo Trainer & Admin",
    image: member1,
    time: "4:00 PM to 6:00 PM & 9:00 PM to 11:00 PM",
    whatsapp: "https://wa.me/+8801772271543",
  },
  {
    name: "Fariya",
    title: "CNP Promo Trainer & Admin",
    image: member2,
    time: "6:00 PM to 10:00 PM",
    whatsapp: "https://wa.me/+8801879081165",
  },
  {
    name: "Ohona moni priya",
    title: "Main Admin & Head Trainer",
    image: member3,
    time: "6:00 PM to 9:00 PM",
    whatsapp: "https://wa.me/+8801731686679",
  },
];

const QUICK_ICONS = {
  play: PlayIcon,
  document: DocumentTextIcon,
  lightbulb: LightBulbIcon,
  chat: ChatBubbleLeftRightIcon,
  shield: ShieldCheckIcon,
  sparkles: SparklesIcon,
  video: VideoCameraIcon,
  phone: PhoneIcon,
  clock: ClockIcon,
  book: BookOpenIcon,
};

const Training = () => {
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [showTrainerList, setShowTrainerList] = useState(false);
  const { settings } = useSelector((state) => state.user);

  const { data } = useQuery(
    ["user-training"],
    async () => (await api.get("training/payload")).data,
    { staleTime: 30000, retry: 1 }
  );

  const courses = data?.courses?.length ? data.courses : trainingCourses;
  const quickActions = data?.quickActions?.length ? data.quickActions : TRAINING_QUICK_ACTIONS;
  const trainers = data?.trainers?.length ? data.trainers : TRAINING_TRAINERS;

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20 pt-6">
      <div className="container mx-auto px-4 max-w-5xl space-y-8">
        
        {/* 🌟 Top Dark Hero Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0b0c2a] via-[#151954] to-[#0b0c2a] p-6 sm:p-8 lg:p-10 text-white shadow-xl border border-indigo-900/30">
          <div className="absolute -right-10 -top-10 w-80 h-80 bg-purple-600/20 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-blue-600/15 rounded-full blur-2xl pointer-events-none"></div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center relative z-10">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-indigo-200 text-xs font-bold tracking-wide">
                <SparklesIcon className="w-3.5 h-3.5 text-amber-300" />
                <span>ট্রেনিং & সাপোর্ট সেন্টার</span>
              </div>

              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white leading-tight tracking-tight">
                শিখুন, এগিয়ে যান, <br />
                <span className="bg-gradient-to-r from-amber-300 via-orange-300 to-pink-400 bg-clip-text text-transparent">
                  আমরা আছি আপনার সাথে 🎓
                </span>
              </h1>

              <p className="text-indigo-200/90 text-xs sm:text-sm max-w-lg leading-relaxed">
                নতুন কিছু শিখুন, কাজের দক্ষতা বাড়ান এবং যেকোনো সমস্যায় দ্রুত সহায়তা পান।
              </p>
            </div>

            {/* Right 3D Illustration */}
            <div className="lg:col-span-4 flex justify-center">
              <div className="relative w-44 sm:w-52 lg:w-64 aspect-square">
                <img
                  src="/training_hero_illustration.jpg"
                  alt="Training and Support"
                  className="w-full h-full object-contain drop-shadow-2xl rounded-2xl hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* 🎴 Dual-Card Feature Split Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 -mt-2">
          
          {/* Card 1: ট্রেনিং সেন্টার */}
          <Card className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-primary-light text-primary flex items-center justify-center text-2xl shrink-0 font-bold">
                📖
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#0b0c2a]">ট্রেনিং সেন্টার</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  ভিডিও, গাইড ও টিপস দেখে নতুন কিছু শিখুন এবং দক্ষতা বাড়ান।
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <a
                href="#courses"
                className="w-full"
              >
                <Button className="w-full bg-primary hover:bg-primary-hover normal-case text-white text-xs font-bold py-3 rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-2">
                  <span>শেখা শুরু করুন</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Button>
              </a>
            </div>
          </Card>

          {/* Card 2: সাপোর্ট পেজে মেসেজ করুন */}
          <Card className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl shrink-0">
                🎧
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-[#0b0c2a]">সাপোর্ট পেজে মেসেজ করুন</h3>
                <p className="text-xs text-gray-500 leading-relaxed">
                  যেকোনো সমস্যা ও প্রশ্নের তাৎক্ষণিক উত্তরের জন্য সাপোর্ট সেন্টারে যোগাযোগ করুন।
                </p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              {settings?.links?.supportMessanger ? (
                <a href={settings.links.supportMessanger} target="_blank" rel="noopener noreferrer" className="w-full">
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 normal-case text-white text-xs font-bold py-3 rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2">
                    <span>মেসেজ পাঠান</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Button>
                </a>
              ) : (
                <Link
                  to="/user/message"
                  className="w-full"
                >
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 normal-case text-white text-xs font-bold py-3 rounded-xl shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2">
                    <span>মেসেজ পাঠান</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              )}
            </div>
          </Card>
        </div>

        {/* 📚 "জনপ্রিয় ট্রেনিং" (Popular Training Courses List) */}
        <section id="courses" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base sm:text-lg font-bold text-[#0b0c2a]">
              জনপ্রিয় ট্রেনিং
            </h2>
            <button
              onClick={() => setSelectedCourse(courses[0])}
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>সবগুলো দেখুন</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {courses.map((course) => (
              <Card
                key={course.id}
                className="p-4 sm:p-5 bg-white rounded-3xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group"
              >
                {/* Left Info with Course Banner */}
                <div className="flex items-start sm:items-center gap-4 flex-1">
                  <div
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${course.bg} text-white flex items-center justify-center text-2xl shrink-0 shadow-md group-hover:scale-105 transition-transform`}
                  >
                    {course.icon}
                  </div>

                  <div className="space-y-1">
                    <h3 className="text-sm sm:text-base font-bold text-[#0b0c2a] group-hover:text-primary transition-colors leading-snug">
                      {course.title}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-1">
                      {course.subtitle}
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 flex items-center gap-1">
                        <BookOpenIcon className="w-3 h-3 text-primary" />
                        {course.lessons}
                      </span>
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        📊 {course.level}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right Action */}
                <div className="w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100 flex justify-end">
                  <Button
                    onClick={() => setSelectedCourse(course)}
                    className="w-full sm:w-auto bg-primary hover:bg-primary-hover normal-case font-bold text-white text-xs px-5 py-2.5 rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-1.5 transition-all hover:scale-105"
                  >
                    <span>শুরু করুন</span>
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* 💬 Bottom Messenger Support Card */}
        <Card className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-teal-50 via-cyan-50/70 to-sky-50/60 border border-teal-100/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary text-white flex items-center justify-center text-3xl shadow-lg shadow-teal-500/25 shrink-0">
              💬
            </div>
            <div className="space-y-1 text-left">
              <h3 className="text-base sm:text-lg font-black text-[#0b0c2a]">
                এখনও সাহায্য প্রয়োজন?
              </h3>
              <p className="text-xs text-gray-600 leading-relaxed max-w-md">
                আমাদের সাপোর্ট টিম সবসময় আপনার পাশে আছে। মেসেঞ্জারে মেসেজ করে দ্রুত সহায়তা পান।
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            {settings?.links?.supportMessanger ? (
              <a href={settings.links.supportMessanger} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                <Button className="w-full md:w-auto bg-primary hover:bg-primary-hover normal-case text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>মেসেঞ্জারে মেসেজ করুন</span>
                </Button>
              </a>
            ) : (
              <Link to="/user/message" className="w-full md:w-auto">
                <Button className="w-full md:w-auto bg-primary hover:bg-primary-hover normal-case text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md shadow-teal-500/20 flex items-center justify-center gap-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4" />
                  <span>মেসেঞ্জারে মেসেজ করুন</span>
                </Button>
              </Link>
            )}
            
            <Button
              variant="outlined"
              onClick={() => setShowTrainerList(!showTrainerList)}
              className="border-teal-200 text-primary normal-case text-xs font-bold px-4 py-3 rounded-xl hover:bg-white"
            >
              ট্রেইনারগণ
            </Button>
          </div>
        </Card>

        {/* 👥 Official Trainer Contacts (Expandable) */}
        {showTrainerList && (
          <div className="p-6 bg-white rounded-3xl border border-gray-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold text-[#0b0c2a]">অফিশিয়াল ট্রেইনার ও সাপোর্ট টিম</h3>
              </div>
              <IconButton
                variant="text"
                size="sm"
                onClick={() => setShowTrainerList(false)}
              >
                <XMarkIcon className="w-4 h-4" />
              </IconButton>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {trainers.map((trainer, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-gray-100 bg-gray-50/50 flex flex-col items-center text-center space-y-2"
                >
                  {trainer.image ? (
                    <img
                      src={trainer.image}
                      alt={trainer.name}
                      className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-primary"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full object-cover shadow-sm border-2 border-primary bg-brand-gradient flex items-center justify-center text-white font-black text-xl">
                      {(trainer.name || "T").charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-bold text-sm text-[#0b0c2a]">{trainer.name}</p>
                    <p className="text-[11px] text-gray-500">{trainer.title}</p>
                    <p className="text-[10px] text-primary font-semibold mt-1">
                      🕒 {trainer.time}
                    </p>
                  </div>

                  <a
                    href={trainer.whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full mt-2"
                  >
                    <Button
                      size="sm"
                      className="w-full bg-[#25D366] hover:bg-[#20bd5a] normal-case text-xs font-bold flex items-center justify-center gap-1.5 rounded-xl shadow-sm"
                    >
                      <img src={whatsappIcon} alt="WhatsApp" className="w-4 h-4" />
                      <span>WhatsApp</span>
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* 🎥 Interactive Course Details Modal */}
      <Dialog
        open={!!selectedCourse}
        handler={() => setSelectedCourse(null)}
        size="md"
        className="rounded-3xl p-2 bg-white shadow-2xl"
      >
        <DialogHeader className="flex justify-between items-center pb-2">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{selectedCourse?.icon}</span>
            <Typography variant="h6" className="font-bold text-[#0b0c2a]">
              {selectedCourse?.title}
            </Typography>
          </div>
          <IconButton
            variant="text"
            onClick={() => setSelectedCourse(null)}
          >
            <XMarkIcon className="w-5 h-5" />
          </IconButton>
        </DialogHeader>

        <DialogBody className="space-y-4 max-h-[70vh] overflow-y-auto">
          {selectedCourse && (
            <div className="space-y-4">
              {/* Video Player */}
              <div className="rounded-2xl overflow-hidden shadow-md aspect-video bg-black">
                <ReactPlayer
                  url={selectedCourse.videoUrl}
                  width="100%"
                  height="100%"
                  controls
                />
              </div>

              <div className="p-4 rounded-2xl bg-primary-light border border-teal-100 space-y-2">
                <p className="text-xs font-bold text-primary">এই লেসনে যা শিখবেন:</p>
                <ul className="space-y-1 text-xs text-gray-700">
                  {selectedCourse.topics.map((topic, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>{topic}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </DialogBody>

        <DialogFooter className="flex justify-between items-center gap-2 pt-2">
          <Button
            variant="text"
            color="red"
            onClick={() => setSelectedCourse(null)}
            className="normal-case text-xs"
          >
            বন্ধ করুন
          </Button>
          <Link to="/user/works">
            <Button
              className="bg-primary hover:bg-primary-hover normal-case text-white text-xs px-6 py-2.5 rounded-xl flex items-center gap-1.5"
            >
              <span>কাজ শুরু করুন</span>
              <ArrowRightIcon className="w-3.5 h-3.5" />
            </Button>
          </Link>
        </DialogFooter>
      </Dialog>

    </div>
  );
};

export default Training;
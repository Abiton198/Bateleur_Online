"use client";

import React from "react";
import { useNavigate, Link } from "react-router-dom";
import {
    ArrowRight,
    BookOpen,
    Cross,
    Globe,
    MonitorPlay,
    Users,
    ShieldCheck,
} from "lucide-react";

import logo from "../img/bateleur1.png";
import student from "../img/student.jpg";

const LandingPage: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-[#F5F0E6] text-[#173641] overflow-hidden relative">

            {/* FAINT LOGO BACKGROUND */}
            <div className="absolute inset-0 flex items-center justify-end opacity-[0.08] pointer-events-none">
                <img
                    src={logo}
                    alt="Bateleur watermark"
                    className="w-[850px] max-w-none"
                />
            </div>

            {/* NAVBAR */}
            <header className="relative z-20">
                <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">

                    {/* LOGO */}
                    <div className="flex items-center gap-4">
                        <img
                            src={logo}
                            alt="Bateleur Online Academy"
                            className="w-16 h-16 object-contain"
                        />

                        <div>
                            <h1 className="text-3xl font-black tracking-wide leading-none">
                                BATELEUR
                            </h1>

                            <p className="uppercase tracking-[0.2em] text-sm text-[#27444F]/80">
                                Online Academy
                            </p>
                        </div>
                    </div>

                    {/* NAV BUTTON */}
                    <div className="flex gap-4">
                        <button
                            onClick={() => navigate("/login")}
                            className="border border-[#173641] text-[#173641] hover:bg-[#173641] hover:text-white transition px-6 py-3 rounded-xl font-semibold"
                        >
                            Enroll Now
                        </button>
                    </div>
                </div>
            </header>

            {/* HERO */}
            <main className="relative z-10">
                <div className="max-w-7xl mx-auto px-6 pt-10 pb-16">

                    {/* TOP TAGS */}
                    <div className="flex flex-wrap gap-4 mb-10">

                        <div className="border border-[#B6B28B] bg-[#ECE7D7] px-6 py-3 rounded-full flex items-center gap-3 shadow-sm">
                            <BookOpen size={18} className="text-[#7C8B5A]" />

                            <span className="font-semibold tracking-wide">
                                British Curriculum
                            </span>
                        </div>

                        <button
                            onClick={() => navigate("/login")}
                            className="bg-[#E7AA42] hover:bg-[#d89a34] text-white px-6 py-3 rounded-full font-bold animate-pulse shadow-lg transition"
                        >
                            Portal Access
                        </button>
                    </div>

                    {/* HERO CONTENT */}
                    <div className="grid lg:grid-cols-2 gap-16 items-center">

                        {/* LEFT SIDE */}
                        <div className="max-w-4xl">

                            <div className="w-32 h-1 bg-[#D9A441] rounded-full mb-8"></div>

                            <p className="text-2xl leading-relaxed text-[#27444F]/90 max-w-3xl mb-12">
                                A premium British Curriculum online academy providing
                                live interactive lessons, small classes, and biblical
                                teaching from Primary School to High School.
                            </p>

                            {/* FEATURE TAGS */}
                            <div className="flex flex-wrap gap-10 mb-14">

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#E8E3D2] p-3 rounded-2xl">
                                        <BookOpen className="text-[#7C8B5A]" />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg">
                                            British Curriculum
                                        </h3>

                                        <p className="text-[#27444F]/70">
                                            Globally Recognised
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#E8E3D2] p-3 rounded-2xl">
                                        <Users className="text-[#7C8B5A]" />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg">
                                            Small Classes
                                        </h3>

                                        <p className="text-[#27444F]/70">
                                            Individual Attention
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#E8E3D2] p-3 rounded-2xl">
                                        <MonitorPlay className="text-[#7C8B5A]" />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg">
                                            Live Lessons
                                        </h3>

                                        <p className="text-[#27444F]/70">
                                            Interactive Learning
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="bg-[#E8E3D2] p-3 rounded-2xl">
                                        <Cross className="text-[#7C8B5A]" />
                                    </div>

                                    <div>
                                        <h3 className="font-bold text-lg">
                                            Christian Values
                                        </h3>

                                        <p className="text-[#27444F]/70">
                                            Faith in Focus
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* CTA BUTTONS */}
                            <div className="flex flex-wrap gap-6">

                                <button
                                    onClick={() => navigate("/login")}
                                    className="bg-[#173641] hover:bg-[#102A31] text-white px-10 py-5 rounded-2xl font-bold text-lg shadow-xl flex items-center gap-3 transition hover:scale-[1.02]"
                                >
                                    Enrol Your Child Today
                                    <ArrowRight size={22} />
                                </button>

                                {/* <button
                                    onClick={() => navigate("/about")}
                                    className="border-2 border-[#173641] text-[#173641] hover:bg-[#173641] hover:text-white px-10 py-5 rounded-2xl font-bold text-lg transition flex items-center gap-3"
                                >
                                    Learn More
                                    <ArrowRight size={22} />
                                </button> */}
                            </div>
                        </div>

                        {/* RIGHT SIDE IMAGE */}
                        <div className="relative flex justify-center lg:justify-end">

                            {/* Glow Background */}
                            <div className="absolute w-[420px] h-[420px] bg-[#D9A441]/20 blur-3xl rounded-full"></div>

                            {/* Student Image Card */}
                            <div className="relative bg-white/60 backdrop-blur-md border border-[#DCCFAE] rounded-[2.5rem] p-4 shadow-2xl">

                                <img
                                    src={student}
                                    alt="Student learning online"
                                    className="w-full max-w-[500px] rounded-[2rem] object-cover"
                                />

                                {/* Floating Badge */}
                                <div className="absolute -bottom-6 -left-6 bg-[#173641] text-white px-6 py-4 rounded-2xl shadow-xl">
                                    <p className="text-sm uppercase tracking-wider text-[#D9A441] mb-1">
                                        British Curriculum
                                    </p>

                                    <h3 className="font-bold text-xl">
                                        Live Interactive Learning
                                    </h3>
                                </div>

                                {/* Floating Card */}
                                <div className="absolute -top-5 -right-5 bg-[#E7AA42] text-white px-5 py-3 rounded-2xl shadow-lg animate-pulse">
                                    <p className="font-bold text-sm">
                                        ENROL NOW
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BOTTOM FEATURES */}
                    <div className="border-t border-[#D5CEBE] pt-10 mt-24 grid md:grid-cols-3 gap-10">

                        <div className="flex gap-4">
                            <ShieldCheck className="text-[#D9A441] mt-1" />

                            <div>
                                <h3 className="font-bold text-xl">
                                    Primary to High School
                                </h3>

                                <p className="text-[#27444F]/70">
                                    Strong foundations. Bright futures.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Globe className="text-[#D9A441] mt-1" />

                            <div>
                                <h3 className="font-bold text-xl">
                                    International Opportunities
                                </h3>

                                <p className="text-[#27444F]/70">
                                    Preparing learners for the world.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Cross className="text-[#D9A441] mt-1" />

                            <div>
                                <h3 className="font-bold text-xl">
                                    Spirit-Led Education
                                </h3>

                                <p className="text-[#27444F]/70">
                                    Nurturing hearts and minds.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* FOOTER */}
            <footer className="relative z-10 border-t border-[#D5CEBE] py-8 mt-6">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-6 text-sm text-[#27444F]/70">

                    <div>
                        © {new Date().getFullYear()} Bateleur Online Academy
                    </div>

                    <div className="flex gap-6">

                        <Link
                            to="/privacy-policy"
                            className="hover:text-[#173641]"
                        >
                            Privacy Policy
                        </Link>

                        <Link
                            to="/delete-account-request"
                            className="hover:text-[#173641]"
                        >
                            Delete Account
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
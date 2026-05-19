"use client";

import React, { useState, useEffect, useRef } from "react";
import { auth, db, googleProvider } from "@/lib/firebaseConfig";
import {
  signInWithPopup,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";

import {
  doc,
  collection,
  query,
  where,
  getDocs,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Loader2, AlertCircle, X, Eye, EyeOff } from "lucide-react";

import TeacherApplicationModal from "../dashboards/TeacherApplicationModal";
import { useNavigate } from "react-router-dom";

/* ─────────────────────────────────────────────
   Utility: redirect to the correct dashboard
   based on role string from Firestore
───────────────────────────────────────────── */
function dashboardPath(role: string): string {
  const map: Record<string, string> = {
    parent: "/parent-dashboard",
    teacher: "/teacher-dashboard",
    principal: "/principal-dashboard",
    admin: "/admin-dashboard",
  };
  return map[role] ?? "/parent-dashboard";
}

export default function LoginForm() {
  /* ─── refs ─────────────────────────────── */
  const redirectedRef    = useRef(false); // prevents double-redirect from listener
  const isGoogleFlowRef  = useRef(false); // blocks listener during Google login
  const isStudentFlowRef = useRef(false); // blocks listener during student login

  /* ─── UI state ──────────────────────────── */
  const [tab, setTab]               = useState<"signin" | "student" | "signup">("signin");
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [username, setUsername]     = useState("");
  const [selectedRole, setSelectedRole] = useState("");

  const [authLoading, setAuthLoading]       = useState(false);
  const [studentLoading, setStudentLoading] = useState(false);
  const [loading, setLoading]               = useState(true);

  const [error, setError] = useState<string | null>(null);

  /* ─── teacher modal state ───────────────── */
  const [showTeacherModal, setShowTeacherModal] = useState(false);
  const [teacherUid, setTeacherUid]             = useState<string | null>(null);

  const navigate = useNavigate();

  const ROLES = [
    { value: "parent",    label: "Parent" },
    { value: "teacher",   label: "Teacher" },
    { value: "principal", label: "Principal" },
  ];

  /* ══════════════════════════════════════════
     AUTH STATE LISTENER
     Only handles email/password login.
     Google and student flows manage their own
     redirects using the ref flags above.
  ══════════════════════════════════════════ */
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      // Skip if another flow is already handling navigation
      if (isGoogleFlowRef.current || isStudentFlowRef.current) {
        setLoading(false);
        return;
      }

      // Skip anonymous users or if we already redirected
      if (!user || redirectedRef.current || user.isAnonymous) {
        setLoading(false);
        return;
      }

      try {
        const snap = await getDoc(doc(db, "users", user.uid));

        if (!snap.exists()) {
          // User authenticated but no Firestore doc — sign them out gracefully
          setError("Account setup incomplete. Please register again.");
          await auth.signOut();
          setLoading(false);
          return;
        }

        const data = snap.data();
        const role = data.role as string;
        const appStatus = data.applicationStatus as string | undefined;

        /* Teacher whose application is still pending (not yet submitted) */
        if (role === "teacher" && appStatus === "pending") {
          setTeacherUid(user.uid);
          setShowTeacherModal(true);
          setLoading(false);
          return;
        }

        /* All other roles — including "submitted" / "approved" teachers — go straight to dashboard */
        redirectedRef.current = true;
        navigate(dashboardPath(role));
      } catch (err) {
        console.error("Auth listener error:", err);
        setLoading(false);
      }
    });

    return () => unsub();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /* ══════════════════════════════════════════
     GOOGLE SIGN-IN / REGISTER
  ══════════════════════════════════════════ */
  const handleGoogle = async () => {
    if (authLoading) return;

    if (tab === "signup" && !selectedRole) {
      setError("Please select a role before continuing.");
      return;
    }

    setAuthLoading(true);
    setError(null);

    // Tell the auth listener to stand down — we handle navigation here
    isGoogleFlowRef.current = true;

    try {
      googleProvider.setCustomParameters({ prompt: "select_account" });
      const result = await signInWithPopup(auth, googleProvider);
      const user   = result.user;
      const uid    = user.uid;

      const userRef  = doc(db, "users", uid);
      const existing = await getDoc(userRef);

      /* ────────────────────────────────────────
         EXISTING USER
         Always read role from Firestore — never
         fall back to selectedRole for existing accounts.
      ──────────────────────────────────────── */
      if (existing.exists()) {
        const data      = existing.data();
        const role      = data.role as string;
        const appStatus = data.applicationStatus as string | undefined;

        // Teacher still needs to complete their application form
        if (role === "teacher" && appStatus === "pending") {
          setTeacherUid(uid);
          setShowTeacherModal(true);
          return; // modal handles next step
        }

        // Everyone else → correct dashboard
        redirectedRef.current = true;
        navigate(dashboardPath(role));
        return;
      }

      /* ────────────────────────────────────────
         NEW USER REGISTRATION
         selectedRole is guaranteed non-empty for
         signup tab; default "parent" for sign-in tab
         (edge case where someone clicks Google on sign-in
         without an existing account).
      ──────────────────────────────────────── */
      const roleToUse = selectedRole || "parent";

      const baseProfile = {
        uid,
        email:          user.email,
        firstName:      user.displayName?.split(" ")[0] ?? "",
        lastName:       user.displayName?.split(" ").slice(1).join(" ") ?? "",
        fullName:       user.displayName ?? "",
        photoURL:       user.photoURL ?? "",
        role:           roleToUse,
        profileCompleted: false,
        createdAt:      serverTimestamp(),
        updatedAt:      serverTimestamp(),
      };

      /* ── master users doc ── */
      await setDoc(userRef, {
        ...baseProfile,
        applicationStatus: roleToUse === "teacher" ? "pending" : "approved",
      });

      /* ── role-specific collection doc ── */
      if (roleToUse === "parent") {
        await setDoc(doc(db, "parents", uid), {
          ...baseProfile,
          students:       [],
          address:        "",
          contact:        "",
          title:          "",
          linkedStudents: 0,
        });
      }

      if (roleToUse === "principal") {
        await setDoc(doc(db, "principals", uid), {
          ...baseProfile,
          schoolName: "",
          schoolCode: "",
          address:    "",
          contact:    "",
          verified:   false,
        });
      }

      if (roleToUse === "teacher") {
        await setDoc(doc(db, "teachers", uid), {
          ...baseProfile,
          subjects: [],
          grades:   [],
          bio:      "",
          verified: false,
        });

        await setDoc(doc(db, "teacherApplications", uid), {
          teacherId:  uid,
          email:      user.email,
          status:     "pending",
          submitted:  false,
          createdAt:  serverTimestamp(),
        });

        // Show application form — don't navigate yet
        setTeacherUid(uid);
        setShowTeacherModal(true);
        return;
      }

      /* parent / principal → go straight to dashboard */
      redirectedRef.current = true;
      navigate(dashboardPath(roleToUse));

    } catch (err: any) {
      console.error("Google auth failed:", err);
      setError(err.message ?? "Authentication failed. Please try again.");
    } finally {
      setAuthLoading(false);
      // Release the flag so the listener can work normally again
      isGoogleFlowRef.current = false;
    }
  };

  /* ══════════════════════════════════════════
     EMAIL / PASSWORD SIGN-IN
     Navigation is handled by onAuthStateChanged above.
  ══════════════════════════════════════════ */
  const handleEmailLogin = async () => {
    if (authLoading) return;
    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    setError(null);
    setAuthLoading(true);

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged takes it from here
    } catch (err: any) {
      const code = err?.code as string | undefined;
      if (code === "auth/user-not-found" || code === "auth/wrong-password" || code === "auth/invalid-credential") {
        setError("Incorrect email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Please try again later.");
      } else {
        setError("Sign-in failed. Please try again.");
      }
    } finally {
      setAuthLoading(false);
    }
  };

  /* ══════════════════════════════════════════
     STUDENT LOGIN (username-only, no Firebase Auth)
  ══════════════════════════════════════════ */
  const handleStudentLogin = async () => {
    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }

    setStudentLoading(true);
    setError(null);
    isStudentFlowRef.current = true;

    try {
      const normalizedUsername = username.trim().toLowerCase().replace(/\s+/g, "");

      const q    = query(collection(db, "students"), where("username", "==", normalizedUsername));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError("Student not found. Please check your username.");
        return;
      }

      if (snap.size > 1) {
        setError("Duplicate username detected. Please contact your administrator.");
        return;
      }

      const studentDoc = snap.docs[0];
      const student    = studentDoc.data();

      if (student.loginEnabled === false) {
        setError("Student login has been disabled. Please contact your school.");
        return;
      }

      sessionStorage.setItem(
        "studentSession",
        JSON.stringify({
          studentId:   studentDoc.id,
          firstName:   student.firstName  ?? "Student",
          lastName:    student.lastName   ?? "",
          grade:       student.grade      ?? "N/A",
          role:        "student",
          loginMethod: "username-only",
          loginTime:   Date.now(),
        })
      );

      navigate(`/student-dashboard/${studentDoc.id}`);

    } catch (err) {
      console.error("Student login error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setStudentLoading(false);
      isStudentFlowRef.current = false;
    }
  };

  /* ══════════════════════════════════════════
     TEACHER APPLICATION SUBMITTED
  ══════════════════════════════════════════ */
  const handleTeacherSubmitted = async () => {
    if (!teacherUid) return;

    try {
      await updateDoc(doc(db, "users", teacherUid), {
        applicationStatus: "submitted",
        profileCompleted:  true,
        updatedAt:         serverTimestamp(),
      });

      await updateDoc(doc(db, "teacherApplications", teacherUid), {
        status:    "submitted",
        submitted: true,
        updatedAt: serverTimestamp(),
      });

      setShowTeacherModal(false);
      redirectedRef.current = true;
      navigate("/teacher-dashboard");
    } catch (err) {
      console.error("Teacher submission failed:", err);
      setError("Failed to submit application. Please try again.");
    }
  };

  /* ══════════════════════════════════════════
     LOADING SCREEN
  ══════════════════════════════════════════ */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-[#E7AA42]" size={40} />
      </div>
    );
  }

  /* ══════════════════════════════════════════
     MAIN UI
  ══════════════════════════════════════════ */
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-md rounded-[2rem] shadow-2xl overflow-hidden border-none bg-white">

        {/* Header */}
        <CardHeader className="relative bg-[#E7AA42] text-white text-center py-10">
          <button
            onClick={() => navigate("/")}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close"
          >
            <X size={20} />
          </button>
          <CardTitle className="text-4xl font-black tracking-tight">BATELEUR ONLINE</CardTitle>
          <CardDescription className="text-amber-100 mt-1">Academy Portal</CardDescription>
        </CardHeader>

        <CardContent className="p-8 space-y-6">

          {/* Error banner */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Tabs
            value={tab}
            onValueChange={(v) => {
              setTab(v as typeof tab);
              setError(null);
              setSelectedRole("");
            }}
          >
            <TabsList className="grid grid-cols-3 bg-slate-100 rounded-2xl p-1">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="student">Student</TabsTrigger>
              <TabsTrigger value="signup">Register</TabsTrigger>
            </TabsList>

            {/* ── Sign In ── */}
            <TabsContent value="signin" className="space-y-4 pt-2">
              <Input
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                autoComplete="email"
              />
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleEmailLogin()}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <Button
                className="w-full bg-[#E7AA42] hover:bg-[#d09a38] text-white"
                onClick={handleEmailLogin}
                disabled={authLoading}
              >
                {authLoading
                  ? <Loader2 className="animate-spin mr-2" size={16} />
                  : "Sign In"
                }
              </Button>
            </TabsContent>

            {/* ── Student Login ── */}
            <TabsContent value="student" className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-600">Student Username</label>
                <Input
                  placeholder="e.g. donald (dj).van aswegen"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleStudentLogin()}
                  autoComplete="off"
                  className="h-12"
                />
              </div>
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 h-12 text-base font-semibold"
                onClick={handleStudentLogin}
                disabled={studentLoading || !username.trim()}
              >
                {studentLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="animate-spin" size={18} /> Accessing Dashboard...
                  </span>
                ) : (
                  "Access My Dashboard"
                )}
              </Button>
              <p className="text-center text-xs text-slate-500">
                No password required · Just type your username
              </p>
            </TabsContent>

            {/* ── Register ── */}
            <TabsContent value="signup" className="space-y-4 pt-2">
              <Select value={selectedRole} onValueChange={setSelectedRole}>
                <SelectTrigger>
                  <SelectValue placeholder="I am registering as..." />
                </SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRole && (
                <p className="text-xs text-slate-500 text-center">
                  Click "Continue with Google" below to complete registration as a{" "}
                  <span className="font-semibold text-[#E7AA42]">{selectedRole}</span>.
                </p>
              )}
            </TabsContent>
          </Tabs>

          {/* Google button — works for both sign-in and registration */}
          <Button
            variant="outline"
            className="w-full border-slate-200 hover:bg-slate-50 flex items-center gap-2"
            onClick={handleGoogle}
            disabled={authLoading}
          >
            {authLoading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <>
                {/* Google "G" icon */}
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden>
                  <path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v8.5h12.7c-.5 2.8-2.2 5.2-4.7 6.8v5.6h7.6c4.5-4.1 7-10.2 7-16.4z"/>
                  <path fill="#34A853" d="M24 47c6.5 0 11.9-2.1 15.8-5.8l-7.6-5.6c-2.1 1.4-4.8 2.2-8.2 2.2-6.3 0-11.6-4.2-13.5-9.9H2.6v5.8C6.5 41.8 14.7 47 24 47z"/>
                  <path fill="#FBBC05" d="M10.5 28.9c-.5-1.4-.8-2.9-.8-4.9s.3-3.4.8-4.9v-5.8H2.6C.9 16.7 0 20.2 0 24s.9 7.3 2.6 10.7l7.9-5.8z"/>
                  <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.7 0 6.5 5.2 2.6 13.3l7.9 5.8C12.4 13.7 17.7 9.5 24 9.5z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

        </CardContent>
      </Card>

      {/* Teacher Application Modal */}
      <TeacherApplicationModal
        open={showTeacherModal}
        userId={teacherUid}
        applicationId={teacherUid}
        onSubmitted={handleTeacherSubmitted}
        onClose={() => setShowTeacherModal(false)}
      />

      {/* WhatsApp floating button */}
      <a
        href="https://wa.me/27656564983"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 bg-green-500 text-white px-5 py-3 rounded-full shadow-lg hover:bg-green-600 transition-colors font-medium text-sm"
      >
        WhatsApp
      </a>
    </div>
  );
}
import { MapPin, GraduationCap, Briefcase, Mail } from "lucide-react";
import profileImage from "../asset/img1.png";

export function SidebarProfile() {
  return (
    <div className="space-y-8">
      {/* Profile Image */}
      <div className="relative">
        <div
          className="absolute -top-6 -right-6 w-24 h-24 opacity-20"
          style={{
            backgroundImage: "radial-gradient(circle, #000 1px, transparent 1px)",
            backgroundSize: "8px 8px",
          }}
        ></div>
        <div className="absolute -bottom-4 -right-4 text-red-400 opacity-30">
          <svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M20 100 Q60 40 100 100"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <img
          src={profileImage}
          alt="Divyanshu Rauniyar"
          className="w-full rounded-2xl shadow-xl object-cover aspect-[4/5]"
        />
      </div>

      {/* Contact Info */}
      <div className="space-y-3 text-sm text-muted-foreground">
        <div className="flex items-center gap-3">
          <MapPin className="w-4 h-4 text-foreground" />
          <span>Nepal</span>
        </div>
        <div className="flex items-center gap-3">
          <GraduationCap className="w-4 h-4 text-foreground" />
          <span>Aspiring Tech Enthusiast</span>
        </div>
        <div className="flex items-center gap-3">
          <Briefcase className="w-4 h-4 text-foreground" />
          <span>Founder, Black Byte</span>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="w-4 h-4 text-foreground" />
          <span>divyanshu@example.com</span>
        </div>
      </div>
    </div>
  );
}

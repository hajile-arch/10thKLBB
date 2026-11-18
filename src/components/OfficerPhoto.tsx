import { useEffect, useState } from "react";
import { DEFAULT_PHOTO, Officer, officerPhotoCandidates } from "../firebase/officerService";

interface OfficerPhotoProps {
  officer: Pick<Officer, "name" | "photo">;
  className?: string;
  alt?: string;
}

// Shows an officer's photo, trying .jpg, .png, .jpeg and .webp in turn,
// then the default picture if none exists
const OfficerPhoto = ({ officer, className, alt }: OfficerPhotoProps) => {
  const candidates = [...officerPhotoCandidates(officer), DEFAULT_PHOTO];
  const key = candidates.join("|");
  const [index, setIndex] = useState(0);

  // Start again if the officer's name or photo setting changes
  useEffect(() => setIndex(0), [key]);

  return (
    <img
      src={candidates[index]}
      alt={alt ?? officer.name}
      loading="lazy"
      className={className}
      onError={() => setIndex((i) => Math.min(i + 1, candidates.length - 1))}
    />
  );
};

export default OfficerPhoto;

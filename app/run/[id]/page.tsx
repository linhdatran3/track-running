import React from "react";
import RunDetailClient from "./RunDetailClient";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params); // unwrap Promise<{ id }>
  return <RunDetailClient id={id} />;
}

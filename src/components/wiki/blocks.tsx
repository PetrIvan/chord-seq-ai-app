interface Props {
  children: React.ReactNode;
}

export default function Blocks({ children }: Props) {
  return (
    <div className="grid grid-flow-row grid-cols-[repeat(auto-fit,minmax(40dvh,1fr))] gap-2 py-2">
      {children}
    </div>
  );
}

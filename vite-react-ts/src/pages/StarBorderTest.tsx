import StarBorder from '../components/StarBorder';

export default function StarBorderTest() {
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-8 p-8">
      <h1 className="text-4xl font-bold text-white mb-8">Star Border Test</h1>
      
      <StarBorder
        as="button"
        color="cyan"
        speed="5s"
      >
        Cyan Star Border
      </StarBorder>

      <StarBorder
        as="button"
        color="magenta"
        speed="4s"
      >
        Magenta Star Border
      </StarBorder>

      <StarBorder
        as="button"
        color="white"
        speed="6s"
      >
        White Star Border
      </StarBorder>
    </div>
  );
}

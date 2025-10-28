import TweetCard from '@/components/slide/TweetCard';
import TextType from '@/components/TextType';

const Page1 = () => {
  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="absolute top-0 left-0 p-8">
        <TextType
          text="Welcome to Page 1"
          as="h1"
          className="text-4xl font-bold text-white"
          showCursor={false}
          typingSpeed={50}
          loop={false}
          startOnVisible={true}
        />
          <p className="text-lg text-gray-400 mt-2">TweetCard Demo</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full">
        <TweetCard
          avatar="https://api.dicebear.com/7.x/avataaars/svg?seed=Alice"
          name="Alice Johnson"
          date="2025-10-28"
          content="Excited to share our new component library! Built with React, TypeScript, and GSAP for amazing animations. Check it out! 🚀"
          borderColor="#3b82f6"
          borderSpeed="5s"
        />
        </div>
      </div>
    </div>
  );
};

export default Page1;

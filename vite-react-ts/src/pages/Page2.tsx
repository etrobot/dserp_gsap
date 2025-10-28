import FeatureCell from '@/components/slide/FeatureCell';
import TextType from '@/components/TextType';

const Page2 = () => {
  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="absolute top-0 left-0 p-8">
        <TextType
          text="Page 2: Features"
          as="h1"
          className="text-4xl font-bold text-white"
          showCursor={false}
          typingSpeed={50}
          loop={false}
          startOnVisible={true}
        />
          <p className="text-lg text-gray-400 mt-2">Vertical Layout Demo</p>
      </div>
      
      <div className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl w-full">
        <FeatureCell
          icon="⚡"
          title="Lightning Fast"
          subtitle="Optimized performance for smooth animations"
          layout="vertical"
          borderColor="#f59e0b"
        />
        </div>
      </div>
    </div>
  );
};

export default Page2;

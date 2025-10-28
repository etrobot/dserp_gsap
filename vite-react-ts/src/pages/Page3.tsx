import FeatureCell from '@/components/slide/FeatureCell';
import ImgContainer from '@/components/slide/ImgContainer';
import CanvasContainer from '@/components/slide/CanvasContainer';
import TextType from '@/components/TextType';

const Page3 = () => {
  return (
    <div className="w-full h-full flex flex-col relative">
      <div className="absolute top-0 left-0 p-8">
        <TextType
          text="Page 3: Mixed Content"
          as="h1"
          className="text-4xl font-bold text-white"
          showCursor={false}
          typingSpeed={50}
          loop={false}
          startOnVisible={true}
        />
      </div>
      
      <div className="flex-1 flex items-center justify-center px-12">
        <div className="grid grid-cols-2 gap-8 w-full max-w-5xl">
        <div className="space-y-6">
          <FeatureCell
            icon="💡"
            title="Smart Solutions"
            subtitle="Innovative approaches to complex problems"
            layout="horizontal"
            borderColor="#ec4899"
          />
          <FeatureCell
            icon="🔒"
            title="Secure & Safe"
            subtitle="Enterprise-grade security measures"
            layout="horizontal"
            borderColor="#06b6d4"
          />
        </div>
        
        <div className="space-y-6">
          <ImgContainer
            src="https://api.dicebear.com/7.x/shapes/svg?seed=demo"
            alt="Demo Image"
            className="w-full h-48"
            borderColor="#eab308"
          />
          
          <CanvasContainer
            className="w-full h-48"
            borderColor="#f43f5e"
          >
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900 text-white text-2xl font-bold">
              Canvas / Chart Here
            </div>
          </CanvasContainer>
        </div>
        </div>
      </div>
    </div>
  );
};

export default Page3;

import SearchBar from "../../../components/SearchBar";
import Sidebar from "../../../components/Sidebar";

function PlayerBar() {
    return (
      <div className="fixed bottom-0 left-[260px] right-0 h-[70px] bg-[#232f3e] flex items-center px-8 shadow-lg z-30">
      {/* Book cover */}
      <img src="/cover.jpg" className="w-12 h-16 object-cover rounded mr-4" alt="" />
      {/* Title/author */}
      <div className="mr-8 text-white">
        <div className="font-semibold text-[15px]">How to Win Friends...</div>
        <div className="text-xs text-[#a0aec0]">Dale Carnegie</div>
      </div>
      {/* Controls */}
      <div className="flex items-center gap-2 mr-8">
        {/* Prev, Play, Next icons */}
      </div>
      {/* Progress */}
      <div className="flex items-center flex-1">
        <span className="text-xs text-white mr-2">00:00</span>
        <input
          type="range"
          min={0}
          max={100}
          value={0}
          className="flex-1 h-1 accent-blue-400"
        />
        <span className="text-xs text-white ml-2">03:24</span>
      </div>
    </div>  
    )
}

export default function Player() {
  return (
    <div className="flex min-h-screen bg-white">
      <aside className="w-[260px] fixed left-0 top-0 bottom-0 z-20 border-r border-[#e1e7ea] bg-white">
        <Sidebar />
      </aside>
      <main className="ml-[260px] flex-1 px-12 py-10 pb-24 bg-white min-h-screen">
        <SearchBar />
        <h1 className="text-3xl font-bold text-[#232f3e] mt-6 mb-4">
          How to Win Friends and Influence People in the Digital Age
        </h1>
        <div className="text-base text-[#232f3e] max-w-3xl leading-relaxed">
 How to Win Friends and Influence People is a timeless classic
            written by Dale Carnegie, first published in 1936. The book is
            widely regarded as one of the best self-help books ever written and
            has sold over 30 million copies worldwide. In 2011, a revised
            edition was published, titled How to Win Friends and Influence
            People in the Digital Age. The book was updated to address the
            challenges of the digital age and provide guidance on how to
            navigate the complexities of modern communication and social media.
            The original book focused on the art of human communication and
            provided readers with strategies for building strong relationships,
            overcoming interpersonal conflicts, and becoming more effective
            communicators. The revised edition builds on these principles and
            updates them for the digital age. The book recognizes that the
            proliferation of technology and social media has created new
            opportunities for communication and connection, but has also made it
            more difficult to connect with others on a deep and meaningful
            level. The first section of the book is devoted to building
            relationships in the digital age. The author argues that despite the
            abundance of social media platforms, people are more isolated than
            ever before. He suggests that the key to building strong
            relationships is to focus on the needs and desires of others. He
            encourages readers to listen actively and empathetically, to show
            genuine interest in others, and to be generous with their time and
            resources. These strategies apply both online and offline and are
            essential for building strong relationships in the digital age. The
            second section of the book focuses on communicating effectively in
            the digital age. The author acknowledges that modern communication
            technology has made it easier than ever to communicate with others,
            but has also made it more difficult to convey complex emotions and
            ideas. He suggests that the key to effective communication is to be
            clear and concise, to use simple language and avoid jargon, and to
            be mindful of the tone and style of your message. He also stresses
            the importance of using technology appropriately, and suggests that
            people should avoid using text messaging and email for important
            conversations, as they are less personal and can easily be
            misinterpreted. The third section of the book focuses on influencing
            others in the digital age. The author argues that in the digital
            age, influence is more important than ever before. He suggests that
            the key to influencing others is to be genuine and authentic, to
            communicate your message clearly and persuasively, and to be mindful
            of the needs and desires of your audience. He also stresses the
            importance of building a personal brand, and suggests that people
            should focus on developing a strong online presence that reflects
            their values and expertise. The final section of the book focuses on
            leadership in the digital age. The author argues that in the digital
            age, leaders must be able to inspire and motivate their followers,
            and must be able to navigate the complex and rapidly changing world
            of technology and social media. He suggests that the key to
            effective leadership is to be a good listener, to be open to new
            ideas and perspectives, and to be willing to take risks and try new
            approaches. He also stresses the importance of building a strong
            team, and suggests that leaders should focus on creating a culture
            of collaboration and innovation. Overall, How to Win Friends and
            Influence People in the Digital Age is an excellent guide for anyone
            looking to improve their communication skills, build strong
            relationships, and become more effective leaders in the digital age.
            The book provides readers with practical strategies and advice for
            navigating the complex world of modern communication and social
            media, and is an essential resource for anyone looking to succeed in
            today's rapidly changing world.
        </div>
      </main>
      <PlayerBar />
      </div>
  );
}
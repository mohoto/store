export default function Video() {
  return (
    <section className="pt-4 pb-20 bg-white">
      <div className="md:max-w-7xl md:mx-auto w-full">
        <div className="grid md:grid-cols-2 gap-y-12 md:gap-x-28 px-4 md:px-0">
          {/* Contenu textuel */}
          <div className="space-y-6 md:col-span-1">
            <div className="space-y-4">
              <div className="mb-4">
                <span className="inline-block bg-black text-white px-3 py-1 rounded text-sm font-medium">
                  IW STORE
                </span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                Des arrivages permanents pour tous les goûts
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed">
                Découvrez notre sélection qui se renouvelle constamment pour
                vous offrir les dernières tendances et les pièces les plus
                exclusives.
              </p>
            </div>
          </div>

          {/* Vidéo */}
          <div className="aspect-w-16 aspect-h-9 md:col-span-1">
            <video
              src="/video/video-bag.mp4"
              title="Video player"
              controls
              className="w-full h-full rounded-lg"
            >
              Votre navigateur ne supporte pas la lecture de vidéos.
            </video>
          </div>
        </div>
      </div>
    </section>
  );
}

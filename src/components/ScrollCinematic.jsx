import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const sequences = [
  {
    label: 'Phase 01',
    title: 'Ignition Frame',
    body:
      'The first scroll pass locks the silhouette into view and gives the landing page a clean, cinematic opening.',
  },
  {
    label: 'Phase 02',
    title: 'Surface Drift',
    body:
      'Highlights, reflections and body lines move with the reel, so the motion feels engineered rather than decorative.',
  },
  {
    label: 'Phase 03',
    title: 'Driver Focus',
    body:
      'The sequence resolves into a calmer, high-contrast close that hands the page back to the rest of the experience.',
  },
];

export default function ScrollCinematic() {
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [isVideoReady, setIsVideoReady] = useState(false);

  useEffect(() => {
    const video = videoRef.current;

    if (!video) {
      return undefined;
    }

    const media = gsap.matchMedia();

    const context = gsap.context(() => {
      media.add('(min-width: 768px) and (prefers-reduced-motion: no-preference)', () => {
        const copyBlocks = gsap.utils.toArray('.cinematic-copy-block');
        let progress = 0;

        const syncVideo = () => {
          if (!video.duration) {
            return;
          }

          const targetTime = video.duration * progress;

          if (Math.abs(video.currentTime - targetTime) > 0.04) {
            video.currentTime = targetTime;
          }
        };

        const primeVideo = () => {
          video.pause();
          syncVideo();
        };

        gsap.set(copyBlocks, {
          autoAlpha: 0,
          y: 52,
          filter: 'blur(18px)',
        });
        gsap.set(copyBlocks[0], {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
        });
        gsap.set('.cinematic-progress-fill', {
          scaleX: 0.08,
          transformOrigin: 'left center',
        });

        video.pause();
        video.muted = true;
        video.loop = false;
        video.playsInline = true;
        video.preload = 'auto';

        if (video.readyState >= 1) {
          primeVideo();
        } else {
          video.addEventListener('loadedmetadata', primeVideo);
        }

        const timeline = gsap.timeline({
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
          },
        });

        timeline
          .fromTo(
            '.cinematic-media-shell',
            {
              y: 88,
              scale: 0.9,
              rotateX: 10,
              rotateY: -8,
            },
            {
              y: 0,
              scale: 1,
              rotateX: 0,
              rotateY: 0,
              ease: 'none',
              duration: 3,
            },
            0,
          )
          .fromTo(
            '.cinematic-video',
            {
              scale: 1.18,
            },
            {
              scale: 1,
              ease: 'none',
              duration: 3,
            },
            0,
          )
          .fromTo(
            '.cinematic-video-scrim',
            {
              opacity: 0.78,
            },
            {
              opacity: 0.28,
              ease: 'none',
              duration: 3,
            },
            0,
          )
          .fromTo(
            '.cinematic-copy-stack',
            {
              y: 16,
            },
            {
              y: -28,
              ease: 'none',
              duration: 3,
            },
            0,
          )
          .to(
            '.cinematic-progress-fill',
            {
              scaleX: 1,
              ease: 'none',
              duration: 3,
            },
            0,
          )
          .fromTo(
            '.cinematic-bottom-bar',
            {
              y: 36,
              opacity: 0.42,
            },
            {
              y: 0,
              opacity: 1,
              ease: 'none',
              duration: 1.4,
            },
            0.32,
          );

        copyBlocks.forEach((block, index) => {
          const offset = index * 0.96;

          timeline
            .to(
              block,
              {
                autoAlpha: 1,
                y: 0,
                filter: 'blur(0px)',
                duration: 0.35,
                ease: 'none',
              },
              offset,
            )
            .to(
              block,
              {
                autoAlpha: index === copyBlocks.length - 1 ? 1 : 0.14,
                y: index === copyBlocks.length - 1 ? 0 : -34,
                filter:
                  index === copyBlocks.length - 1 ? 'blur(0px)' : 'blur(10px)',
                duration: 0.38,
                ease: 'none',
              },
              offset + 0.62,
            );
        });

        const scrubTrigger = ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.2,
          onUpdate: ({ progress: nextProgress }) => {
            progress = nextProgress;
            syncVideo();
          },
        });

        return () => {
          video.removeEventListener('loadedmetadata', primeVideo);
          scrubTrigger.kill();
        };
      });

      media.add('(max-width: 767px), (prefers-reduced-motion: reduce)', () => {
        const autoplayVideo = () => {
          video.currentTime = 0;
          video.muted = true;
          video.loop = true;
          video.play().catch(() => {});
        };

        if (video.readyState >= 2) {
          autoplayVideo();
        } else {
          video.addEventListener('canplay', autoplayVideo);
        }

        gsap.from('.cinematic-copy-block, .cinematic-progress, .cinematic-media-shell', {
          opacity: 0,
          y: 34,
          filter: 'blur(12px)',
          duration: 0.9,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
          },
        });

        return () => {
          video.removeEventListener('canplay', autoplayVideo);
          video.pause();
        };
      });
    }, sectionRef);

    return () => {
      media.revert();
      context.revert();
    };
  }, []);

  return (
    <section className="section cinematic-section" id="cinematic" ref={sectionRef}>
      <div className="cinematic-sticky">
        <div className="section-shell cinematic-shell">
          <div className="cinematic-copy-rail">
            <p className="section-tag cinematic-tag">Scene 02 / Scroll Reel</p>

            <div className="cinematic-copy-stack">
              {sequences.map((sequence) => (
                <article className="cinematic-copy-block" key={sequence.title}>
                  <span className="cinematic-copy-overline">{sequence.label}</span>
                  <h2 className="cinematic-copy-title">{sequence.title}</h2>
                  <p className="cinematic-copy-body">{sequence.body}</p>
                </article>
              ))}
            </div>

            <div className="cinematic-progress">
              <span className="cinematic-progress-label">Scroll-synced opening film</span>
              <span className="cinematic-progress-track" aria-hidden="true">
                <span className="cinematic-progress-fill" />
              </span>
            </div>
          </div>

          <div className={`cinematic-media-shell${isVideoReady ? ' is-ready' : ''}`}>
            <div className="cinematic-media-frame">
              <video
                ref={videoRef}
                className="cinematic-video"
                src="/media/0430.mp4"
                muted
                playsInline
                preload="auto"
                onCanPlay={() => setIsVideoReady(true)}
                onLoadedData={() => setIsVideoReady(true)}
              >
                Your browser does not support embedded video.
              </video>

              <div className="cinematic-video-scrim" aria-hidden="true" />
              <div className="cinematic-video-glow" aria-hidden="true" />

              <div className="cinematic-hud">
                <span>0430 / Motion Capture</span>
                <span>{isVideoReady ? 'Sequence Loaded' : 'Buffering Reel'}</span>
              </div>

              <div className="cinematic-bottom-bar">
                <div className="cinematic-specs" aria-hidden="true">
                  <span>Glass reflections</span>
                  <span>Body line sweep</span>
                  <span>Studio-grade pacing</span>
                </div>

                <p className="cinematic-caption">
                  The opening scroll now runs as a pinned film pass, so the homepage
                  reveals the motion language before the rest of the story opens up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

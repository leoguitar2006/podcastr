import { parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import format from "date-fns/format";


import { GetStaticPaths, GetStaticProps } from "next"
import Link from "next/link";
import Head from "next/head";

import { api } from "../../services/api"
import { convertDurationToTimeString } from "../../utils/convertDurationToTimeString";

import Image from "next/image";

import { usePlayer } from "../../contexts/PlayerContext";

import styles from "./episode.module.scss";

interface Episode {
    id: string;
    title: string;
    thumbnail: string;
    members: string;
    published_at: string;
    duration: number,
    durationAsString: string;
    url: string;
    publishedAt: string;
    description: string;
}

interface EpisodeProps {
    episode: Episode;
}

export default function Episode({ episode }: EpisodeProps) {
    const { play } = usePlayer()

    return (
        <div className={styles.episode}>
            <Head>
                <title>{episode.title}</title>
            </Head>

            <div className={styles.thumbnailContainer}>
                <Link href="/">
                    <button type="button">
                        <img src="/arrow-left.svg" alt="Voltar" />
                    </button>
                </Link>
                <Image
                    width={700}
                    height={160}
                    src={episode.thumbnail}
                    objectFit="cover" />

                <button
                    type="button"
                    onClick={() => play(episode)}>
                    <img src="/play.svg" alt="" />
                </button>
            </div>
            <header>
                <h1>{episode.title}</h1>
                <span>{episode.members}</span>
                <span>{episode.publishedAt}</span>
                <span>{episode.durationAsString}</span>
            </header>

            <div className={styles.description} dangerouslySetInnerHTML={{ __html: episode.description }} />
        </div>
    )
}

export const getStaticPaths: GetStaticPaths = async () => { // obrigatorio quando usa getstaticprops e parametros dinamicos na rota
    const { data } = await api.get("episodes", {
        params: {
            _limit: 2,
            _sort: "published_at",
            _order: "desc",
        }
    });

    const paths = data.map(episode => {
        return {
            params: {
                selected_episode: episode.id,
            }
        }
    })

    return {
        paths,
        fallback: "blocking"
    }
}

export const getStaticProps: GetStaticProps = async (ctx) => {
    const { selected_episode } = ctx.params;

    const { data } = await api.get(`/episodes/${selected_episode}`);

    const episode = {
        id: data.id,
        title: data.title,
        thumbnail: data.thumbnail,
        members: data.members,
        publishedAt: format(parseISO(data.published_at), "d MMM yy", {
            locale: ptBR,
        }),
        duration: Number(data.file.duration),
        durationAsString: convertDurationToTimeString(Number(data.file.duration)),
        description: data.description,
        url: data.file.url,
    }

    return {
        props: {
            episode,
        },
        revalidate: 60 * 60 * 24, ///24 hours
    }
}
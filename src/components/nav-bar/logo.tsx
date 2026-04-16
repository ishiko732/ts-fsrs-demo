import Image from 'next/image'
import Link from 'next/link'

const Logo = () => {
  return (
    <div className="mr-4 hidden sm:flex">
      <div className="btn btn-ghost text-xl hidden sm:flex">
        <Image src="/osr.png" alt="TS-FSRS-DEMO" width={32} height={32} />
        <Link
          href={'/'}
          aria-label="home"
          className="hidden font-bold sm:inline-block mt-1 line-clamp-3"
        >
          TS-FSRS-DEMO
        </Link>
      </div>
    </div>
  )
}

export default Logo

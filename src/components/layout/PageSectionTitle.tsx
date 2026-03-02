type PageSectionTitleProps = {
  title: string
}

export function PageSectionTitle({ title }: PageSectionTitleProps) {
  return (
    <h2 className="text-[18px] leading-[120%] tracking-[0em] font-normal text-[#1F1F1F]">
      {title}
    </h2>
  )
}
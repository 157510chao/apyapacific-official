with open('.git_anti_original.html', 'r', encoding='utf-8') as f:
    s = f.read()

# 找 page-header 段（section 1）
p1 = s.find('<section class="page-header">')
p1_end = s.find('</section>', p1) + len('</section>')
print(f'page-header 段: {p1} - {p1_end} (长度 {p1_end - p1})')

# 找 cordycepin-report 主 section
p2 = s.find('section-block py-section cordycepin-report')
# 找这个 section 结束：因为它包含嵌套 section，所以用以下特征定位：</div>\n        </section>\n    </main>
# 即 "</section>\n    </main>" 是主 section 的结束
# 找到 pos p2 之后第一个 "</section>\n    </main>"
end_marker = '</section>\n    </main>'
p2_end = s.find(end_marker, p2) + len('</section>')
print(f'cordycepin-report 主 section: {p2} - {p2_end} (长度 {p2_end - p2})')

# 验证：从 p2 到 p2_end 末尾的 100 字符
print('主 section 末尾 200 字符:')
print(repr(s[p2_end - 200:p2_end]))
